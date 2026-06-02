import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { ServicePlace } from "@/types/service";

const ServicesMapClient = dynamic(() => import("./ServicesMapClient"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

interface Props {
  places: ServicePlace[];
  onSelect: (p: ServicePlace) => void;
  selected: ServicePlace | null;
}

export default function ServicesMapContainer(props: Props) {
  return <ServicesMapClient {...props} />;
}
