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

export default function AddressAutocomplete({
  onSelect,
  proximity,
  placeholder = "Enter address…",
  className,
  initialQuery,
  countryCode,
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
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    });
    importLibrary("places").then(() => {
      if (!alive) return;
      acServiceRef.current = new google.maps.places.AutocompleteService();
      // Initialize PlacesService using a detached element to avoid any DOM side-effects
      const detachedHostEl = document.createElement("div");
      placesServiceRef.current = new google.maps.places.PlacesService(
        detachedHostEl
      );
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
        componentRestrictions: {
          country: [countryCode?.toLowerCase() ?? "us"],
        },
        sessionToken: sessionTokenRef.current ?? undefined,
      };

      if (proximity) {
        req.locationBias = {
          center: new google.maps.LatLng(proximity.lat, proximity.lng),
          radius: 50_000, // ✅ fix
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
  }, [query, proximity, focused, countryCode]);

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
          className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-popover shadow-lg max-h-72 overflow-auto"
        >
          {preds.map((p, i) => (
            <li
              key={p.place_id}
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
              <div className="font-medium text-foreground">
                {p.structured_formatting.main_text}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {p.structured_formatting.secondary_text}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
