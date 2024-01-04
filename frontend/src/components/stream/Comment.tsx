import ProfileUser from "../../assets/images/profile-user.png";

interface CommentProps {
  comment: {
    id:string;
    content: string;
    user: {
      id: string;
      name: string;
      picture: string;
    };
  };
}

const Comment: React.FC<CommentProps> = ({ comment }) => (
  <div key={comment.id}>
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8 overflow-hidden rounded-full cursor-pointer">
        <img src={comment.user.picture && comment.user.picture === null ? comment.user.picture : ProfileUser} alt={comment.user.name} className="object-cover" />
      </div>
      <span className="font-sans text-sm font-semibold text-white">{comment.user.name}</span>
    </div>
    <pre className="my-4 font-sans text-sm text-white break-words whitespace-pre-wrap">{comment.content}</pre>
  </div>
);

export default Comment;
