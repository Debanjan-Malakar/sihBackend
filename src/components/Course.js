import React from 'react';
import {Link} from 'react-router-dom'
import "./Course.css";

const Course = (props) => {
  return (
    
    <div className='course88'>

      <div className='course_img88'>
        <img src={props.image} />
      </div>

      <h2>{props.platform}</h2>

      <Link target="_blank" to={props.url}><button className='course-btn88'>View Details</button></Link>

    </div>

  );
}

export default Course;
