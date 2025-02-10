use k8s_openapi::api::core::v1::Event;
use k8s_openapi::Resource;
use kube::api::ListParams;
use kube::Api;
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

pub async fn list_resources<T>(client: Client, namespace: &str) -> Result<Vec<T>, String>
where
    T: Resource<Scope = kube::core::NamespaceResourceScope>
        + Clone
        + std::fmt::Debug
        + k8s_openapi::Metadata<Ty = k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta>
        + serde::de::DeserializeOwned,
{
    let api = Api::namespaced(client, namespace);
    let list = api
        .list(&ListParams::default())
        .await
        .map_err(|e| e.to_string())?;
    Ok(list.items)
}

pub async fn get_resource<T>(client: Client, namespace: &str, name: &str) -> Result<T, String>
where
    T: Resource<Scope = kube::core::NamespaceResourceScope>
        + Clone
        + std::fmt::Debug
        + k8s_openapi::Metadata<Ty = k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta>
        + serde::de::DeserializeOwned,
{
    let api = Api::namespaced(client, namespace);
    let resource = api.get(name).await.map_err(|e| e.to_string())?;
    Ok(resource)
}

pub async fn delete_resource<T>(client: Client, namespace: &str, name: &str) -> Result<(), String>
where
    T: Resource<Scope = kube::core::NamespaceResourceScope>
        + Clone
        + std::fmt::Debug
        + k8s_openapi::Metadata<Ty = k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta>
        + serde::de::DeserializeOwned,
{
    let api: Api<T> = Api::namespaced(client, namespace);
    let _ = api
        .delete(name, &Default::default())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn list_events<T>(
    client: Client,
    namespace: &str,
    name: &str,
) -> Result<Vec<Event>, String>
where
    T: Resource,
{
    let events: Api<Event> = Api::namespaced(client, namespace);
    let list = events
        .list(&ListParams::default().fields(&format!(
            "involvedObject.name={},involvedObject.kind={}",
            name,
            T::KIND
        )))
        .await
        .map_err(|e| e.to_string())?;
    Ok(list.items)
}
