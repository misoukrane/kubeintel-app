use crate::k8s_client;
use k8s_openapi::api::apps::v1::Deployment;

// list all deployments in a namespace
#[tauri::command]
pub async fn list_deployments(
    kubeconfig_path: String,
    context: String,
    namespace: String,
) -> Result<Vec<Deployment>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::list_resources::<Deployment>(client, &namespace).await
}

// get a deployment by name in a namespace
#[tauri::command]
pub async fn get_deployment(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
) -> Result<Deployment, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::get_resource::<Deployment>(client, &namespace, &name).await
}
