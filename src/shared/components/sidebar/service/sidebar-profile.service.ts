import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { SidebarProfileData } from "../model/sidebar.model";
import { http } from "@/services/http";

type SidebarProfileResponse = {
  ok: boolean;
  data: SidebarProfileData;
};

export async function fetchSidebarProfile(): Promise<SidebarProfileData> {
  const { data } = await http.get<SidebarProfileResponse>(
    API_ROUTES.auth.sidebarProfile,
  );

  return data.data;
}
