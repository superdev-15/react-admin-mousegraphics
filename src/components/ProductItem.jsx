import { parseISO, format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductItem (props) {
  const {article, view, row, sectionId, slug, setShowModal, setLoaded} = props
  let navigate = useNavigate();
  const [image, setImage] = useState("")
  

  useEffect(() => {
    if (article['Html'] !== undefined) {
      const content = JSON.parse(article['Html'].replace(/(<([^>]+)>)/ig,""))
      setImage(getImage(content, 'mainpic'))
    }
  }, [article])

  const getImage = (content, attr) => {
    if (content[attr] && content[attr].indexOf('{"') !== -1) {
      const image = JSON.parse(content[attr]);
      if ( image['SourcePath'] !== undefined ) {
        return image['SourcePath'];
      }
      return '';
    }
    return '';
  }

  const editArticle = () => {
    setLoaded(true)
    setTimeout(() => {
      setLoaded(false)
      navigate('/dashboard/articles/edit/' + sectionId + '/' + article["Id"],
        {
          state: { 
            sectionSlug: slug
          }
        }
      )
    }, 1500);
    
  }

  const handleModal = () => {
    setShowModal(true, article["Id"])
  }

  return (
    <>
    {view === "list" && 
      <a className="relative block grid-each">
        <input type="text" readOnly hidden value={article["CanonicalUrl"]} style={{position: 'absolute', zIndex: -100}}/>
        <div className="row-xs-height border-ebebeb">
          <div className="col-lg-2 col-sm-3 relative pl-sm-0 col-xs-height col-xs-middle pl-xs-0">
            {/* If copy clipboard */}
            <div className="clipboard absolute border-ebebeb">
              <div className="p small inline-block bg-white pl-sm-20 pl-xs-10 pr-sm-20 pr-xs-10 pt-sm-10 pb-sm-10 pt-xs-5 pb-xs-5">
              the link has been copied to your clipboard
                  <span className="pl-xs-10 icon-ok"></span>
              </div>
            </div>
            <span className="icon-share"></span>
            {/* Image */}
            <div className="icon-move background-white relative block ar-lg-65 ar-xs-65 upload-big hover-opacity overflow-hidden hover-opacity"
              onClick={editArticle}
            >
              <img className="always-center" src={image}/>
            </div>
          </div>
          {/* Desc */}
          <div className="col-lg-6 col-sm-5 relative col-xs-height col-xs-middle">
              <p className="nobel">{article['DisplayDate']}</p>
              <p className="large ellipsis pt-xs-5">
                <span className={article['Active'] ? "published" : "unpublished"}></span>
                {article['Title']}
              </p>
            </div>
            {/* Handle */}
            <div className="col-lg-2 col-sm-2 relative col-xs-height col-xs-middle text-center">
              <p className="big-arrow icon-sign-in" onClick={editArticle}>edit</p>
            </div>
            <div className="col-lg-2 col-sm-2 relative col-xs-height col-xs-middle text-center">
              <p className="icon-close" style={{zIndex: 1}} onClick={() => handleModal()}>delete</p>
            </div>
        </div>
      </a>
    }
    { view === "grid" && 
      <a className="relative block grid-each">
        <input type="text" hidden readOnly value={article["CanonicalUrl"]} style={{position: 'absolute', zIndex: -100}}/>
        {/* If copy clipboard */}
        <div className="clipboard absolute">
          <div className="p small inline-block border-ebebeb bg-white pl-sm-20 pl-xs-10 pr-sm-20 pr-xs-10 pt-sm-10 pb-sm-10 pt-xs-5 pb-xs-5">the link has been copied to your clipboard <span className="pl-xs-10 icon-ok"></span></div>
        </div>

        <span className="icon-share"></span>
        {/* Image */}
        <div 
          className="background-white relative block ar-lg-70 ar-xs-75 border-ebebeb upload-big hover-opacity overflow-hidden hover-opacity"
          onClick={editArticle}
        >
          <img className="always-center" src={image}/>
        </div>

        {/* Desc */}
        <div className="pt-sm-15 pt-xs-10 h115">
          <p className="nobel">{format(parseISO(article['DisplayDate']), "dd.M.yyyy")}</p>
          <p className="large pt-xs-10 ellipsis">
            <span className={article['Active'] ? "published" : "unpublished"}></span>
            {article['Title']}
          </p>
          <div className="d-flex align-items-center justify-content-between">
            <p className="big-arrow icon-sign-in mt-sm-15" onClick={editArticle}>edit</p>
            <p className="icon-close mt-sm-15 pull-right" style={{zIndex: 1}} onClick={() => handleModal()}>delete</p>
          </div>
          <div className="clearfix"></div>
        </div>
      </a>
    }
    
    </>
  )
}

export default ProductItem;