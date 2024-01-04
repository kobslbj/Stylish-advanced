import Cookies from "js-cookie";

const sidebarLinks = [
  { href: "/my/profile", text: "我的帳戶" },
  { href: "/my/order-history", text: "訂單紀錄" },
];

const UserSideBar = () => (
  <div className="flex flex-col gap-4 px-8 border-r h-[70vh]">
    {sidebarLinks.map((item) => (
      <a key={item.href} href={item.href} className="block text-xl hover:text-brown">
        {item.text}
      </a>
    ))}
    {Cookies.get("user_role_id") === "1" && (
    <a href="/admin/streamer" className="block text-xl hover:text-brown">
      開啟直播
    </a>
    )}

  </div>
);

export default UserSideBar;
