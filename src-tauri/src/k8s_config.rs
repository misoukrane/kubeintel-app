use kube::{config::Kubeconfig, Client, Config};
use std::path::Path;

#[tauri::command]
pub fn read_kubeconfig(kubeconfig_path: &str) -> Result<Kubeconfig, String> {
    let kubeconfig =
        Kubeconfig::read_from(Path::new(kubeconfig_path)).map_err(|e| e.to_string())?;
    Ok(kubeconfig)
}

#[tauri::command]
pub async fn cluster_info(kubeconfig_path: String, context: String) -> Result<String, String> {
    // Load the kubeconfig file
    let kubeconfig: Kubeconfig =
        Kubeconfig::read_from(Path::new(&kubeconfig_path)).map_err(|e| e.to_string())?;

    // Create a client using the config
    let options = kube::config::KubeConfigOptions {
        context: Some(context),
        ..Default::default()
    };
    let config = Config::from_custom_kubeconfig(kubeconfig, &options)
        .await
        .map_err(|e| e.to_string())?;

    let cluster_url = config.cluster_url.clone();
    let client = Client::try_from(config).map_err(|e| e.to_string())?;

    // Get cluster information
    let version = client
        .apiserver_version()
        .await
        .map_err(|e| e.to_string())?;
    Ok(format!(
        " Kubernetes control plane with version {:?} is Runing at: {:?}",
        version.git_version, cluster_url
    ))
}
