mod credentials;
mod k8s_client;
mod k8s_config;
mod kubectl;
mod namespaces;
mod nodes;
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
            credentials::set_secret,
            credentials::get_secret,
            credentials::remove_secret,
            k8s_config::read_kubeconfig,
            k8s_config::cluster_info,
            namespaces::list_namespaces,
            nodes::list_pods_on_node,
            nodes::debug_node,
            nodes::cordon_node,
            nodes::drain_node,
            nodes::uncordon_node,
            pods::open_pod_shell,
            pods::debug_pod,
            pods::get_pod_logs,
            resources::get_resource,
            resources::list_resource,
            resources::list_resource_events,
            resources::delete_resource,
            resources::scale_resource,
            resources::restart_resource,
            resources::open_resource_events_in_terminal,
            resources::open_resource_logs_in_terminal,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
