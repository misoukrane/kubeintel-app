use crate::k8s_client;
use k8s_openapi::api::apps::v1::Deployment;
use kube::Api;

// list all pods in a namespace
#[tauri::command]
pub async fn list_deployments(
    kubeconfig_path: String,
    context: String,
    namespace: String,
) -> Result<Vec<Deployment>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    // Get all deploys in the namespace
    let deploy = Api::<Deployment>::namespaced(client, &namespace);
    let deployment_list = deploy
        .list(&Default::default())
        .await
        .map_err(|e| e.to_string())?;
    Ok(deployment_list.items)
}
