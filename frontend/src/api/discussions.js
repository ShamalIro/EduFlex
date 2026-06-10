import courseClient from './courseClient';

export const getPosts = async (courseId) => {
  const res = await courseClient.get(`/discussions/course/${courseId}/posts`);
  return res.data.data.posts;
};

export const createPost = async (courseId, content) => {
  const res = await courseClient.post(
    `/discussions/course/${courseId}/posts`,
    { course_id: courseId, content }
  );
  return res.data.data.post;
};

export const createReply = async (postId, content) => {
  const res = await courseClient.post(
    `/discussions/posts/${postId}/replies`,
    { content }
  );
  return res.data.data.reply;
};

export const getReplies = async (postId) => {
  const res = await courseClient.get(
    `/discussions/posts/${postId}/replies`
  );
  return res.data.data.replies;
};

export const upvotePost = async (postId) => {
  const res = await courseClient.patch(
    `/discussions/posts/${postId}/upvote`
  );
  return res.data;
};

export const markBestAnswer = async (replyId) => {
  const res = await courseClient.patch(
    `/discussions/replies/${replyId}/best`
  );
  return res.data;
};

export const reportPost = async (postId) => {
  const res = await courseClient.post(
    `/discussions/posts/${postId}/report`
  );
  return res.data;
};

export const createAnnouncement = async (courseId, content) => {
  const res = await courseClient.post('/discussions/announcements', {
    course_id: courseId,
    content
  });
  return res.data.data.post;
};

export const deletePost = async (postId) => {
  const res = await courseClient.delete(`/discussions/posts/${postId}`);
  return res.data;
};

export const editPost = async (postId, content) => {
  const res = await courseClient.patch(
    `/discussions/posts/${postId}/edit`,
    { content }
  );
  return res.data.data.post;
};

export const editReply = async (replyId, content) => {
  const res = await courseClient.patch(
    `/discussions/replies/${replyId}/edit`,
    { content }
  );
  return res.data.data.reply;
};