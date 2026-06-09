export type MeetMeItem = {
  name: string;
  message: string;
};

export type MeetMeCategory = {
  label: string;
  items: MeetMeItem[];
};

export type MeetMe = {
  id: string;
  slug: string;
  name: string;
  phone: string;
  data: MeetMeCategory[];
  edit_token: string;
  created_at: string;
};
