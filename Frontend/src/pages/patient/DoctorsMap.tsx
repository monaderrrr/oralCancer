import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next"; 

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface Doctor {
    name: string;
    lat?: number;
    lng?: number;
    type?: string;
}

interface Props {
    doctors: Doctor[];
    userLocation?: { lat: number; lng: number } | null;
}

export default function DoctorsMap({ doctors, userLocation }: Props) {
    const { t } = useTranslation(); 

    const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : doctors.length > 0 && doctors[0].lat && doctors[0].lng
            ? [doctors[0].lat, doctors[0].lng]
            : [31.0409, 31.3785]; 

    return (
        <div className="h-[400px] w-full mt-6">
            <MapContainer
                center={center as [number, number]}
                zoom={13}
                className="h-full w-full rounded-lg"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                        <Popup>{t("bookingFlow.mapUserPopup", "You are here")}</Popup>
                    </Marker>
                )}

                {doctors.map((doc, i) => {
                    if (!doc.lat || !doc.lng) return null;

                    return (
                        <Marker key={i} position={[doc.lat, doc.lng]}>
                            <Popup>
                                <b>{doc.name}</b>
                                <br />
                                {doc.type}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}