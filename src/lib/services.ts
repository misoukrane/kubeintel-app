import { V1Service, V1ServicePort } from '@kubernetes/client-node';

// Format service port
export const formatPort = (port: V1ServicePort): string => {
  let portStr = '';
  if (port.name) {
    portStr += `${port.name}: `;
  }
  portStr += `${port.port}`;
  if (port.targetPort) {
    portStr += `→${port.targetPort}`;
  }
  if (port.nodePort) {
    portStr += `:${port.nodePort}`;
  }
  return `${portStr}/${port.protocol || 'TCP'}`;
};

// Get external IP(s) as array
export const getExternalIPs = (svc: V1Service): string[] => {
  const { spec, status } = svc;
  const serviceType = spec?.type || 'ClusterIP';
  const result: string[] = [];

  // External IPs from spec
  if (spec?.externalIPs && spec.externalIPs.length > 0) {
    result.push(...spec.externalIPs);
  }

  // LoadBalancer ingress IPs
  if (serviceType === 'LoadBalancer' && status?.loadBalancer?.ingress) {
    status.loadBalancer.ingress.forEach((ing: any) => {
      if (ing.ip) result.push(ing.ip);
      if (ing.hostname) result.push(ing.hostname);
    });
  }

  return result;
};

// Get external address(es)
export const getExternalAddresses = (service: V1Service): string => {
  const loadBalancer = service.status?.loadBalancer;
  const type = service.spec?.type;

  if (
    type === 'LoadBalancer' &&
    loadBalancer?.ingress &&
    loadBalancer.ingress.length > 0
  ) {
    return loadBalancer.ingress
      .map((ing) => ing.ip || ing.hostname)
      .filter(Boolean)
      .join(', ');
  }

  if (type === 'NodePort') {
    return 'Uses node IP';
  }

  if (type === 'ExternalName') {
    return service.spec?.externalName || 'N/A';
  }

  return 'None';
};
