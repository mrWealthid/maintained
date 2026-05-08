"use client";
import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseGooglePlace } from "@/shared/helper/address.helper";
import type { ParsedAddress } from "@/shared/model/address.model";

type Props = {
  onSelect: (
    addr: ParsedAddress & { countryCode?: string; country?: string }
  ) => void;
  proximity?: { lng: number; lat: number };
  placeholder?: string;
  className?: string;
  initialQuery?: string;
  countryCode?: "US" | "CA" | "GB" | "NG" | "DE";
};

type Suggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

let placesReady: Promise<void> | null = null;
function ensurePlaces(): Promise<void> {
  if (!placesReady) {
    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY! });
    placesReady = importLibrary("places").then(() => undefined);
  }
  return placesReady;
}

// Adapt the new Place object to the legacy PlaceResult shape parseGooglePlace expects.
type NewAddressComponent = {
  longText: string | null;
  shortText: string | null;
  types: string[];
};
function adaptPlace(place: google.maps.places.Place): google.maps.places.PlaceResult {
  const components = (place.addressComponents ?? []) as NewAddressComponent[];
  const address_components: google.maps.GeocoderAddressComponent[] = components.map(
    (c) => ({
      long_name: c.longText ?? "",
      short_name: c.shortText ?? "",
      types: c.types,
    })
  );
  const loc = place.location ?? null;
  return {
    address_components,
    formatted_address: place.formattedAddress ?? undefined,
    place_id: place.id ?? undefined,
    geometry: loc
      ? ({ location: loc } as google.maps.places.PlaceGeometry)
      : undefined,
  };
}

export default function AddressAutocomplete({
  onSelect,
  proximity,
  placeholder = "Enter address…",
  className,
  initialQuery,
  countryCode,
}: Props) {
  const [query, setQuery] = useState("");
  const [preds, setPreds] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const readyRef = useRef(false);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    ensurePlaces().then(() => {
      if (!alive) return;
      readyRef.current = true;
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!readyRef.current) return;
    if (!focused) {
      setPreds([]);
      return;
    }
    if (!query.trim()) {
      setPreds([]);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const req: google.maps.places.AutocompleteRequest = {
          input: query,
          includedPrimaryTypes: ["street_address", "premise", "subpremise"],
          includedRegionCodes: [countryCode ?? "US"],
          sessionToken: sessionTokenRef.current ?? undefined,
        };
        if (proximity) {
          req.locationBias = {
            center: { lat: proximity.lat, lng: proximity.lng },
            radius: 50_000,
          };
        }
        const { suggestions } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            req
          );
        if (!focused) return;
        const mapped: Suggestion[] = suggestions
          .map((s) => s.placePrediction)
          .filter((p): p is google.maps.places.PlacePrediction => p != null)
          .map((p) => ({
            placeId: p.placeId,
            description: p.text?.toString() ?? "",
            mainText: p.mainText?.toString() ?? p.text?.toString() ?? "",
            secondaryText: p.secondaryText?.toString() ?? "",
          }));
        setPreds(mapped);
        setActiveIdx(-1);
      } catch (e) {
        console.error(e);
        setPreds([]);
      } finally {
        setLoading(false);
      }
    }, 220) as unknown as number;

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, proximity, focused, countryCode]);

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

  const handleSelect = async (s: Suggestion) => {
    setQuery(s.description);
    setPreds([]);
    try {
      const place = new google.maps.places.Place({ id: s.placeId });
      await place.fetchFields({
        fields: ["addressComponents", "location", "id", "formattedAddress"],
      });
      // rotate session token after a selection
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
      onSelect(parseGooglePlace(adaptPlace(place)));
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
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          id="address-search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() =>
            setTimeout(() => {
              setFocused(false);
              setPreds([]);
            }, 100)
          }
          autoComplete="off"
          role="combobox"
          aria-expanded={focused && preds.length > 0}
          aria-controls="addr-listbox"
          aria-autocomplete="list"
          className="w-full"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
      {focused && preds.length > 0 && (
        <ul
          id="addr-listbox"
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-sm border border-border bg-popover shadow-xs max-h-72 overflow-auto"
        >
          {preds.map((p, i) => (
            <li
              key={p.placeId}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(p)}
              className={cn(
                "cursor-pointer px-4 py-3 text-sm transition-colors",
                "hover:bg-muted hover:text-accent-foreground",
                i === activeIdx && "bg-muted text-accent-foreground",
                "border-b border-border last:border-b-0"
              )}
            >
              <div className="font-medium text-foreground">{p.mainText}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {p.secondaryText}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
