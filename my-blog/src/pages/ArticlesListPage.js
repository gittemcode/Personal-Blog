import ArticlesList from '../components/ArticlesList';
import articles from './article-content';   


// Defining as function components 
const ArticlesListPage = () => {   

    return (  
        <> 
        <h1> Articles </h1> 
        <ArticlesList articles={articles} />
        </>
    );
    
} 

// Exports the home page components so that we can import5 it into the app component later on and display it 
export default ArticlesListPage;