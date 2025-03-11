import { parseISO, format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function ProductItem (props) {
  const {article, view, row, sectionId, slug, setShowModal, setLoaded} = props
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: `section-${row}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let navigate = useNavigate();
  const [image, setImage] = useState("")
  const [clipBoardTxt, setClipBoardTxT] = useState("");

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

  const inlineStyles = {
    opacity: isDragging ? '0.5' : '1',
    transformOrigin: '50% 50%',
    cursor: isDragging ? 'grabbing' : 'grab',
    backgroundColor: '#ffffff',
    // display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center',
    // boxShadow: isDragging  ? 'rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px' : 'rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px',
    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
    ...style,
  };

  const copyToClipboard = async (value) => {
    try {
      console.log(value)
      setClipBoardTxT(value)
      await navigator.clipboard.writeText(value);
      setTimeout(()=> {
        setClipBoardTxT("")
      }, 1500)
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={inlineStyles}
      // withOpacity={isDragging}
      {...attributes}
      {...listeners}
      className={view === 'list' ? "col-sm-12 col-xs-12" : "col-sm-3 col-xs-12 mb-lg-60 mb-md-50 mb-sm-40 mb-xs-30"}
      key={row}
    >
    {view === "list" && 
      <a className="relative grid-each">
        <input type="text" readOnly hidden value={clipBoardTxt} style={{position: 'absolute', zIndex: -100}} onChange={e=> {setClipBoardTxT(article["CanonicalUrl"])}}/>
        <div className="row-xs-height border-ebebeb">
          <div className="col-lg-2 col-sm-3 relative pl-sm-0 col-xs-height col-xs-middle pl-xs-0">
            {/* If copy clipboard */}
            {clipBoardTxt !== "" && 
              <div className="clipboard absolute border-ebebeb">
                <div className="p small inline-block bg-white pl-sm-20 pl-xs-10 pr-sm-20 pr-xs-10 pt-sm-10 pb-sm-10 pt-xs-5 pb-xs-5">
                the link has been copied to your clipboard
                  <span className="pl-xs-10 icon-ok"></span>
                </div>
              </div>
            }
            <span className="icon-share" onClick={() => copyToClipboard(article["CanonicalUrl"])} ></span>
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
      <a className="relative grid-each">
        <input type="text" hidden readOnly value={clipBoardTxt} style={{position: 'absolute', zIndex: -100}} onChange={e=> {setClipBoardTxT(article["CanonicalUrl"])}}/>
        {/* If copy clipboard */}
        {clipBoardTxt !== "" && 
          <div className="clipboard absolute">
            <div className="p small inline-block border-ebebeb bg-white pl-sm-20 pl-xs-10 pr-sm-20 pr-xs-10 pt-sm-10 pb-sm-10 pt-xs-5 pb-xs-5">the link has been copied to your clipboard <span className="pl-xs-10 icon-ok"></span></div>
          </div>
        }

        <span className="icon-share" onClick={() => copyToClipboard(article["CanonicalUrl"])}></span>
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
    </div>
  )
}

export default ProductItem;