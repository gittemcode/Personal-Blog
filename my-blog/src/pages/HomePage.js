import { Link } from "react-router-dom";

// Defining as function components 
const HomePage = () => {  
    return ( 
      <> 
      <h1> Blog Home! </h1>   
      <p> Thank you so much for visiting my blog. </p> 
      <p> This is a prototype I suggest you check out the <Link to="/about">About</Link> page to see why I have created a blog. </p>   
      </>
    );
    
} 

// Exports the home page components so that we can import5 it into the app component later on and display it 
export default HomePage;