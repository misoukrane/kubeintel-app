mod daemonsets;
mod deployments;
mod k8s_client;
mod k8s_config;
mod kubectl;
mod namespaces;
mod pods;
mod resources;
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
            pods::debug_pod,
            deployments::get_deployment,
            daemonsets::get_daemonset,
            statefulsets::get_statefulset,
            deployments::scale_deployment,
            deployments::restart_deployment,
            resources::delete_resource,
            resources::open_resource_events_in_terminal,
            resources::open_resource_logs_in_terminal,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
