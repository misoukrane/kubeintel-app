mod daemonsets;
mod deployments;
mod k8s_client;
mod k8s_config;
mod namespaces;
mod pods;
mod statefulsets;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            k8s_config::read_kubeconfig,
            k8s_config::cluster_info,
            namespaces::list_namespaces,
            pods::list_pods,
            deployments::list_deployments,
            daemonsets::list_daemonsets,
            statefulsets::list_statefulsets,
            pods::get_pod,
            pods::open_pod_shell,
            pods::open_pod_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
