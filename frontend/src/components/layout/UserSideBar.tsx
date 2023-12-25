const sidebarLinks = [
  { href: "/my/profile", text: "我的帳戶" },
  { href: "/my/order-history", text: "訂單紀錄" },
];

const UserSideBar = () => (
  <div className="flex flex-col gap-4 px-8 border-r">
    {sidebarLinks.map((item) => (
      <a key={item.href} href={item.href} className="block text-lg hover:text-brown">
        {item.text}
      </a>
    ))}
  </div>
);

export default UserSideBar;
