import { listServices } from '@/mocks/services';
export function useServices(regionCode?: string, active?: boolean) {
  const services = listServices().filter(
    (service) =>
      (regionCode === undefined ||
        service.location?.regionCode === regionCode) &&
      (active === undefined || service.active === active),
  );
  return { services, isLoading: false, error: null };
}
