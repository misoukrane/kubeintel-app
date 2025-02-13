mod deployments;
mod k8s_client;
mod k8s_config;
mod kubectl;
mod namespaces;
mod pods;
mod resources;

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
            pods::open_pod_shell,
            pods::debug_pod,
            deployments::restart_deployment,
            resources::get_resource,
            resources::list_resource,
            resources::delete_resource,
            resources::scale_resource,
            resources::restart_resource,
            resources::open_resource_events_in_terminal,
            resources::open_resource_logs_in_terminal,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
