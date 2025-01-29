use kube::{config::KubeConfigOptions, config::Kubeconfig, Client, Config};
use std::path::Path;

pub async fn create_k8s_client(kubeconfig_path: String, context: String) -> Result<Client, String> {
    // Load the kubeconfig file
    let kubeconfig: Kubeconfig =
        Kubeconfig::read_from(Path::new(&kubeconfig_path)).map_err(|e| e.to_string())?;

    // Create a client using the config
    let options = KubeConfigOptions {
        context: Some(context),
        ..Default::default()
    };
    let config = Config::from_custom_kubeconfig(kubeconfig, &options)
        .await
        .map_err(|e| e.to_string())?;

    Client::try_from(config).map_err(|e| e.to_string())
}
