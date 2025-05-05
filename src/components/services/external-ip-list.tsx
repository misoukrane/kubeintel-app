interface ExternalIPListProps {
  addresses?: string | string[];
}

export const ExternalIPList = ({ addresses }: ExternalIPListProps) => {
  let ipList: string[] = [];

  if (typeof addresses === 'string') {
    ipList = addresses
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);
  } else if (Array.isArray(addresses)) {
    ipList = addresses.filter(Boolean);
  }

  if (ipList.length === 0) {
    return <span>None</span>;
  }

  return (
    <ul>
      {ipList.map((ip, index) => (
        <li key={index}>
          <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded mr-1 mb-1">
            {ip}
          </span>
        </li>
      ))}
    </ul>
  );
};
