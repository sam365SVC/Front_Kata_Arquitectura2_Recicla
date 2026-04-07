import React from 'react';

const SectionTitleSpecial = (props) => {
  const { itemClass, subTitle, preTitle, highlightText, postTitle } = props;

  return (
    <div className={itemClass ? itemClass : 'it-course-title-box mb-70'}>
      <span className="ed-section-subtitle">
        {subTitle ? subTitle : 'Top Popular Course'}
      </span>
      <h4 className="ed-section-title">
        {preTitle ? preTitle : 'Educom Course'}{' '}
        <span className="p-relative ed-title-shape  z-index">
          {highlightText ? highlightText : 'student'}
         
        </span>{' '}
        {postTitle ? postTitle : ''}
      </h4>
    </div>
  );
};
export default SectionTitleSpecial;
