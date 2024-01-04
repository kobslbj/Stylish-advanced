const sidebarLinks = [
  { href: "/my/profile", text: "我的帳戶" },
  { href: "/my/order-history", text: "訂單紀錄" },
  { href: "/admin/streamer", text: "開啟直播" },
];

const UserSideBar = () => (
  <div className="flex flex-col gap-4 px-8 border-r h-[70vh]">
    {sidebarLinks.map((item) => (
      <a key={item.href} href={item.href} className="block text-xl hover:text-brown">
        {item.text}
      </a>
    ))}
  </div>
);

export default UserSideBar;
