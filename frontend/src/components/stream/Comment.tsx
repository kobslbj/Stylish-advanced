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
      {comment.user.picture && comment.user.picture === null ? (
        <div className="relative w-8 h-8 overflow-hidden rounded-full cursor-pointer">
          <img src={comment.user.picture} alt={comment.user.name} className="object-cover" />
        </div>
      ) : (
        <div className="w-8 h-8 pt-6 pl-6 bg-white rounded-full" />
      )}
      <span className="font-sans text-base font-semibold text-white">{comment.user.name}</span>
    </div>
    <pre className="my-4 font-sans text-base text-white break-words whitespace-pre-wrap">{comment.content}</pre>
  </div>
);

export default Comment;
