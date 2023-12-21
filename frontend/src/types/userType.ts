export interface User {
  access_token: string;
  access_expired: number;
  user: {
    id: number;
    name: string;
    email: string;
    picture: string;
  };
}
