import { useState, useEffect } from "react";
import {
  fetchProductComments,
  likeComment,
  dislikeComment,
} from "../../utils/api";
import Star from "../../assets/images/star.png";
import RedHeart from "../../assets/images/redheart.png";
import Heart from "../../assets/images/heart.png";
import ProfileUser from "../../assets/images/profile-user.png";

type ProductCommentProps = {
  productId: string;
};
type CommentType = {
  commentId: number;
  id: number;
  productId: number;
  userId: number;
  username: string;
  userpicture: string;
  text: string;
  rating: number;
  images_url: string[];
  commentTime: string;
  likes: number;
  isLiked: boolean;
  isLikedNumber: number;
};

const ProductComment = ({ productId }: ProductCommentProps) => {
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    const getComments = async () => {
      try {
        const fetchedComments = await fetchProductComments(productId);
        const commentsWithLikes = fetchedComments.map(
          (comment: { likes: any }) => ({
            ...comment,
            isLiked: false,
            isLikedNumber: comment.likes,
          }),
        );
        setComments(commentsWithLikes);
      } catch (error) {
        console.error("Error fetching product comments:", error);
      }
    };

    getComments();
  }, [productId]);

  const toggleLiked = async (commentId: number, index: number) => {
    try {
      let response;
      if (comments[index].isLiked) {
        response = await dislikeComment(commentId);
      } else {
        response = await likeComment(commentId);
      }

      if (response && response.success) {
        setComments((comments) =>
          comments.map((comment, idx) => {
            if (idx === index) {
              const newIsLiked = !comment.isLiked;
              const newLikes = newIsLiked
                ? comment.likes + 1
                : comment.likes - 1;
              return {
                ...comment,
                isLiked: newIsLiked,
                likes: newLikes,
              };
            }
            return comment;
          }));
      }
    } catch (error) {
      console.error("Error toggling like/dislike:", error);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(<img key={i} src={Star} alt="star" />);
    }
    return stars;
  };
  return (
    <>
      {comments.map((comment, index) => (
        <div
          key={comment.id}
          className="min-h-[12.3125rem] flex-shrink-0 rounded-xl border border-gray-200 bg-white p-[1.6rem] relative mt-5"
        >
          <div className="flex flex-row">
            <div className="w-[5rem] h-[5rem] flex-shrink-0 rounded-[4.74738rem] border ">
              <img
                className="object-cover w-full h-full"
                src={comment.userpicture && ProfileUser}
                alt="User"
              />
            </div>
            <div className="flex flex-col ml-3 mt-[0.69rem]">
              <p className="font-bold">{comment.username}</p>
              <p className="text-[#909090;]">
                {comment.commentTime}
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 flex flex-row gap-3 mt-8 mr-8">
            <p>{comment.likes}</p>
            <button type="button" onClick={() => toggleLiked(comment.commentId, index)}>
              <img
                className="cursor-pointer"
                src={comment.isLiked ? RedHeart : Heart}
                width={25}
                height={25}
                alt="Heart"
              />
            </button>
          </div>
          <div className="flex flex-row mt-1">
            {renderStars(comment.rating)}
          </div>
          <p className="mt-2 font-bold">{comment.text}</p>
          <div className="flex flex-row gap-1 mt-2">
            {comment.images_url.slice(0, 3).map((imageUrl, index) => (
              <div
                key={index}
                className=" w-[20rem] h-[12rem]  rounded-[1rem] "
              >
                <img
                  className="object-cover w-full h-full"
                  src={imageUrl}
                  alt={`item ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductComment;
