import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { MapPin, Stethoscope, Star } from "lucide-react";
import { IMAGE_BASE_URL } from "../../Api";

interface Doctor {
  _id: string;
  fullName: string;
  specialization?: string;
  hospital?: string;
  clinicAddress?: string;
  googleMapsUrl?: string;
  lat?: number | null;
  lng?: number | null;
  profileImage?: string;
  rating?: number;
  createdAt?: string;
}

interface Props {
  doctor: Doctor;
  onSelect: (id: string) => void;
}

export function DoctorCard({ doctor, onSelect }: Props) {
  const doctorId = doctor._id;

  const name = doctor.fullName?.trim() || "Unknown Doctor";

  const specialization = doctor.specialization?.trim() || "Medical Specialist";

  const image = doctor.profileImage
    ? `${IMAGE_BASE_URL}${doctor.profileImage}`
    : null;

  const address =
    `${doctor.clinicAddress || ""} ${doctor.hospital || ""}`.trim() ||
    "Location not available";

  const ratingValue = Number(doctor.rating ?? 0);
  const hasCoordinates = typeof doctor.lat === "number" && typeof doctor.lng === "number";
  const isNewDoctor = doctor.createdAt
    ? Date.now() - new Date(doctor.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : true;

  return (
    <Card className="p-5 border border-slate-100 hover:border-teal-300 hover:shadow-lg transition-all group rounded-2xl bg-white flex flex-col h-full">
      
      <div className="flex items-start gap-4">
        {/* IMAGE CONTAINER */}
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center overflow-hidden border border-teal-100 shrink-0">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <Stethoscope className="text-teal-600 w-7 h-7" />
          )}
        </div>

        {/* INFO */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 truncate text-base leading-tight">
            Dr. {name}
          </h3>

          {isNewDoctor && (
            <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              New Doctor
            </span>
          )}

          {/* DYNAMIC SPECIALIZATION */}
          <p className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest mt-0.5">
            {specialization}
          </p>

          {/* DYNAMIC RATING */}
          <div className="flex items-center gap-1 mt-1.5 bg-yellow-50 w-fit px-2 py-0.5 rounded-lg border border-yellow-100">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[11px] font-bold text-yellow-700">
              {ratingValue.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* LOCATION */}
      <div className="mt-4 flex-1">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <MapPin size={14} className="text-rose-400 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
        {hasCoordinates || doctor.googleMapsUrl ? (
          <a
            href={doctor.googleMapsUrl || `https://www.google.com/maps?q=${doctor.lat},${doctor.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs font-semibold text-teal-700 hover:text-teal-800"
            onClick={(event) => event.stopPropagation()}
          >
            Open in Google Maps
          </a>
        ) : null}
      </div>

      {/* VIEW BUTTON */}
      <Button
        fullWidth
        size="sm"
        className="mt-5 bg-teal-600 hover:bg-teal-700 text-xs h-10 rounded-xl font-bold shadow-sm shadow-teal-100"
        onClick={() => onSelect(doctorId)}
      >
        View Profile
      </Button>

    </Card>
  );
}
