export interface NavigationModule {
  key: string;
  name: string;
  description?: string;
}

export interface NavigationPage {
  id: string;
  name: string;
  path: string;
  feature?: string;
  permissions?: string[];
  modules: NavigationModule[];
}

export interface NavigationSection {
  id: string;
  name: string;
  description?: string;
  pages: NavigationPage[];
}

export interface NavigationResponse {
  sections: NavigationSection[];
}
