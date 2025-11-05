"use client";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { ParsedAddress, parseGooglePlace } from "@/utils/helpers";

type Props = {
  onSelect: (addr: ParsedAddress) => void;
  proximity?: { lng: number; lat: number };
  placeholder?: string;
  className?: string;
  initialQuery?: string;
};

export default function AddressAutocomplete({
  onSelect,
  proximity,
  placeholder = "Enter address…",
  className,
  initialQuery,
}: Props) {
  const [query, setQuery] = useState("");
  const [preds, setPreds] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const acServiceRef = useRef<google.maps.places.AutocompleteService | null>(
    null
  );
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null
  );
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
    // NOTE: we intentionally don't re-run if initialQuery changes,
    // to avoid fighting user typing. If you want it reactive, add it to deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // load Google Places
  useEffect(() => {
    let alive = true;
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["places"],
    });
    loader.load().then(() => {
      if (!alive) return;
      acServiceRef.current = new google.maps.places.AutocompleteService();
      const dummy = document.createElement("div");
      placesServiceRef.current = new google.maps.places.PlacesService(dummy);
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    });
    return () => {
      alive = false;
    };
  }, []);

  // fetch predictions — only when focused
  useEffect(() => {
    if (!acServiceRef.current) return;
    if (!focused) {
      setPreds([]);
      return;
    } // 👈 block if not focused
    if (!query.trim()) {
      setPreds([]);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setLoading(true);
      const req: google.maps.places.AutocompletionRequest = {
        input: query,
        types: ["address"],
        componentRestrictions: { country: ["us"] },
        sessionToken: sessionTokenRef.current ?? undefined,
      };
      if (proximity) {
        req.locationBias = {
          center: new google.maps.LatLng(proximity.lat, proximity.lng),
          radius: 150_000,
        };
      }
      acServiceRef.current!.getPlacePredictions(req, (results) => {
        if (!focused) return; // 👈 user may have blurred
        setPreds(results || []);
        setActiveIdx(-1);
        setLoading(false);
      });
    }, 220) as unknown as number;

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, proximity, focused]);

  // click-away closes list
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPreds([]);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const getDetails = (placeId: string) =>
    new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
      if (!placesServiceRef.current)
        return reject(new Error("PlacesService not ready"));
      placesServiceRef.current.getDetails(
        {
          placeId,
          fields: ["address_component", "geometry", "place_id"],
          sessionToken: sessionTokenRef.current ?? undefined,
        },
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place)
            return reject(new Error(`Place details failed: ${status}`));
          resolve(place);
        }
      );
    });

  const handleSelect = async (p: google.maps.places.AutocompletePrediction) => {
    setQuery(p.description);
    setPreds([]);
    try {
      const place = await getDetails(p.place_id);
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken(); // rotate
      onSelect(parseGooglePlace(place));
      // optional: blur after select
      setFocused(false);
    } catch (e) {
      console.error(e);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!preds.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, preds.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(preds[activeIdx]);
    } else if (e.key === "Escape") {
      setPreds([]);
      setFocused(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)} // 👈 focus on
        onBlur={() =>
          setTimeout(() => {
            // 👈 clear after click can register
            setFocused(false);
            setPreds([]);
          }, 100)
        }
        autoComplete="off"
        role="combobox"
        aria-expanded={focused && preds.length > 0}
        aria-controls="addr-listbox"
      />
      {focused && preds.length > 0 && (
        <ul
          id="addr-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg max-h-72 overflow-auto"
        >
          {preds.map((p, i) => (
            <li
              key={p.place_id}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => e.preventDefault()} // 👈 keep focus for click
              onClick={() => handleSelect(p)}
              className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${i === activeIdx ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            >
              <div className="font-medium">
                {p.structured_formatting.main_text}
              </div>
              <div className="text-xs text-gray-500">
                {p.structured_formatting.secondary_text}
              </div>
            </li>
          ))}
          {loading && (
            <li className="px-3 py-2 text-sm text-gray-500">Searching…</li>
          )}
        </ul>
      )}
    </div>
  );
}
