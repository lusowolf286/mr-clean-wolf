import UIKit
import Capacitor
import EventKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - Mr Clean Wolf: ecrã principal e funções nativas


class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(CWNativePlugin())
    }
    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }
}

/// Funções chamadas pela app (shared/supa.js): partilhar ficheiros e gravar marcações no calendário.
@objc(CWNativePlugin)
public class CWNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CWNativePlugin"
    public let jsName = "CWNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "share", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "calendar", returnType: CAPPluginReturnPromise)
    ]
    private let store = EKEventStore()
    private let mapKey = "cw.calendar.uids"

    // PDF / CSV → folha de partilha do iOS (Mail, WhatsApp, Ficheiros, AirDrop…)
    @objc func share(_ call: CAPPluginCall) {
        guard let name = call.getString("filename"), let b64 = call.getString("base64"),
              let data = Data(base64Encoded: b64) else { call.reject("Ficheiro inválido"); return }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(name)
        do { try data.write(to: url, options: .atomic) } catch { call.reject("Não foi possível gravar o ficheiro"); return }
        DispatchQueue.main.async {
            guard let vc = self.bridge?.viewController else { call.reject("Sem ecrã"); return }
            let av = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            if let pop = av.popoverPresentationController { // iPad
                pop.sourceView = vc.view
                pop.sourceRect = CGRect(x: vc.view.bounds.midX, y: vc.view.bounds.midY, width: 1, height: 1)
                pop.permittedArrowDirections = []
            }
            av.completionWithItemsHandler = { _, done, _, _ in
                if done { call.resolve(["status": "delivered"]) } else { call.reject("Cancelado", "declined") }
            }
            vc.present(av, animated: true)
        }
    }

    // Marcações → calendário predefinido do iPhone. Volta a exportar atualiza a mesma marcação, sem duplicar.
    @objc func calendar(_ call: CAPPluginCall) {
        let events = call.getArray("events", JSObject.self) ?? []
        let proceed: (Bool) -> Void = { granted in
            DispatchQueue.main.async {
                guard granted else { self.alert("Sem acesso ao calendário", "Autorize em Definições → Privacidade e segurança → Calendários → Clean Wolf."); call.resolve(["denied": true]); return }
                var map = UserDefaults.standard.dictionary(forKey: self.mapKey) as? [String: String] ?? [:]
                var added = 0, updated = 0
                for e in events {
                    guard let start = self.date(e["start"] as? String) else { continue }
                    let uid = e["uid"] as? String ?? UUID().uuidString
                    var ev: EKEvent
                    if let id = map[uid], let old = self.store.event(withIdentifier: id) { ev = old; updated += 1 }
                    else { ev = EKEvent(eventStore: self.store); ev.calendar = self.store.defaultCalendarForNewEvents; added += 1 }
                    ev.title = e["title"] as? String ?? "Clean Wolf"
                    ev.notes = e["notes"] as? String
                    ev.location = e["location"] as? String
                    ev.startDate = start
                    ev.endDate = self.date(e["end"] as? String) ?? start.addingTimeInterval(3600)
                    do { try self.store.save(ev, span: .thisEvent); map[uid] = ev.eventIdentifier } catch { continue }
                }
                UserDefaults.standard.set(map, forKey: self.mapKey)
                self.alert("Calendário atualizado", "\(added) marcação(ões) adicionada(s), \(updated) atualizada(s).")
                call.resolve(["added": added, "updated": updated])
            }
        }
        if #available(iOS 17.0, *) { store.requestFullAccessToEvents { ok, _ in proceed(ok) } }
        else { store.requestAccess(to: .event) { ok, _ in proceed(ok) } }
    }

    private func date(_ s: String?) -> Date? {
        guard let s = s else { return nil }
        let f = DateFormatter(); f.locale = Locale(identifier: "en_US_POSIX"); f.timeZone = .current
        f.dateFormat = s.hasSuffix("Z") ? "yyyyMMdd'T'HHmmss'Z'" : "yyyyMMdd'T'HHmmss"
        if s.hasSuffix("Z") { f.timeZone = TimeZone(identifier: "UTC") }
        return f.date(from: s)
    }

    private func alert(_ t: String, _ m: String) {
        guard let vc = bridge?.viewController else { return }
        let a = UIAlertController(title: t, message: m, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "OK", style: .default))
        vc.present(a, animated: true)
    }
}
