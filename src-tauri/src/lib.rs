mod k8s_client;
mod k8s_config;
mod namespaces;
mod pods;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            k8s_config::read_kubeconfig,
            k8s_config::cluster_info,
            namespaces::all_namespaces,
            pods::all_pods
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
