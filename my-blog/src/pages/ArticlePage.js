import { useParams } from 'react-router-dom'; 
import { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import articles from './article-content';
import NotFoundPage from './NotFoundPage';  
import CommentsList from '../components/CommentsList'; 
import AddCommentForm from '../components/AddCommentForm'; 
import useUser from '../hooks/useUser';

// Defining as function components 
const ArticlePage = () => {     
    const [articleInfo, setArticleInfo] = useState({ upvotes: 0, comments: [], canUpvote: false });   
    const { canUpvote } = articleInfo;
    const { articleId } = useParams();  

    const { user, isLoading } = useUser();

    // Simulation for what we are going to do when we get data back from the server 
    useEffect(() => { 
        const loadArticleInfo = async () => {  
            const token = user && await user.getIdToken();  
            const headers = token ? { authtoken: token } : {};
            const response = await axios.get(`/api/articles/${articleId}`, { headers }); 
            const newArticleInfo = response.data;
            setArticleInfo(newArticleInfo);
        } 

        if (!isLoading) { 
          loadArticleInfo();
        }
        // Adding Asynchronous logic in the useEffect
        
    }, [isLoading, user]);  

    
    const article = articles.find(article => article.name === articleId);  

    // Look at the put request in the server and this will make the request then go to the server and make sure it responds with the updated article 
    const addUpvote = async () => {  
      const token = user && await user.getIdToken();  
      const headers = token ? { authtoken: token } : {};
      const response = await axios.put(`/api/articles/${articleId}/upvote`, null, { headers }); 
      const updatedArticle = response.data; 
      setArticleInfo(updatedArticle);
    }

    if (!article) {   
        return <NotFoundPage />
    } 

    return (
      <>
      <h1>{article.title}</h1>
      <div className="upvotes-section">
          {user
              ? <button onClick={addUpvote}>Upvote</button>
              : <button>Log in to upvote</button>}
          <p>This article has {articleInfo.upvotes} upvote(s)</p>
      </div>
      {article.content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
      ))}
      {user
          ? <AddCommentForm
              articleName={articleId}
              onArticleUpdated={updatedArticle => setArticleInfo(updatedArticle)} />
          : <button>Log in to add a comment</button>}
      <CommentsList comments={articleInfo.comments} />
      </>
  );
}

export default ArticlePage;

// Exports the article page components so that we can import5 it into the app component later on and display it 