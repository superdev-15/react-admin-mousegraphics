import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DndContext,
  useSensor, 
  useSensors,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { useSite } from "../context/site";
import { useAuth } from "../context/auth";
import ProductItem from "../components/ProductItem";
import Preloader from "../components/Preloader";
import {
  arrayMove,
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  rectSortingStrategy
} from "@dnd-kit/sortable";

function Dashboard() {
  let auth = useAuth()
  let site =  useSite();
  let navigate = useNavigate();
  const [view, setView] = useState("grid")
  const [sections, setSections] = useState([])
  const [curSection, setCurSection] = useState(-1)
  const [articles, setArticles] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [articleId, setArticleId] = useState("")
  const [loaded, setLoaded] = useState(false)
  const [activeId, setActiveId] = useState("");

  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = useCallback((event) => {
      setActiveId(event.active.id);
  }, []);

  const handleDragCancel = useCallback(() => {
      setActiveId(null);
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    // console.log(event)
    if (active.id !== over.id) {
      setArticles((items) => {
        setLoaded(true)
        const oldIndex = parseInt(active.id.split('-')[1]);
        const newIndex = parseInt(over.id.split('-')[1]);
        const activeItem = items[oldIndex]
        activeItem["SortOrder"] = newIndex
        let formData = {}
        formData.action = "putData";
        formData.uri = "/articles/" + activeItem["Id"]
        formData.data = activeItem
    
        fetch(`/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler`, {
          method: "POST",
          headers: { Auth: auth.user.token},
          body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
          // loadProducts(curSection)
          setLoaded(false)
        })
        .catch(error => {
          setLoaded(false)
          console.log(error)
        })
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const changeViewTo = (item) => {
    setView(item)
  }

  const fetchSections = () => {
    let formData = {}
    formData.action = "getSections";
    fetch(`/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler`, {
      method: "POST",
      headers: { Auth: auth.user.token},
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      let temp = data.filter((section) => { return section.Title !== '' && section.Title !== null})
      site.useUpdateSiteConfig("showPreloader", true)
      setSections(temp)
      setCurSection(temp[0]["Id"])
      loadProducts(temp[0]["Id"])
    })
  }

  const loadProducts = (id) => {
    setLoaded(true)
    let formData = {}
    formData.action = "getArticles";
    formData.params = {
      page: 1,
      perPage: 200,
      sectionId: id
    }
    fetch(`/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler`, {
      method: "POST",
      headers: { Auth: auth.user.token},
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      setArticles(data)
      setLoaded(false)
    })
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const loadData = (id) => {
    if (id !== null) {
      setCurSection(id)
      loadProducts(id)
    } else {
      setArticles([])
      setCurSection(-1)
    }
  }

  const handleModal = (show, id) => {
    setShowModal(show)
    setArticleId(id)
  }

  const handleLoaded = (flag) => {
    setLoaded(flag)
  }

  const Modal = ({ show, onClose, id }) => {
    if (!show) return null; // Hide the modal if show is false
    const onDelete = () => {
      let formData = {}
      formData.action = "deleteData"
      formData.uri = "/articles/" + id

      fetch(`/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler`,{
        method: "POST",
        headers: { Auth: auth.user.token},
        body: JSON.stringify(formData)
      })
      .then(res => res.json())
      .then(data => {
        loadProducts(curSection)
        setShowModal(false)
      })
      .catch(error => {
        console.log(error)
      })
    }
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p className="py-3">Are you sure you want to delete this Project?</p>
          <div className="d-flex align-self-end pt-3">
            <button className="btn" onClick={onDelete} style={{fontSize: 14}}>Delete Project</button>
            <button className="btn" onClick={onClose} style={{fontSize: 14}}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Preloader show={loaded} />
      <div className="container mt-sm-50 mt-xs-30 px-5">
        <div className="row breadcrumb-link" style={{marginBottom: 20}}>
          <div className="col-sm-12 col-xs-12">
            <strong className="black">Content:  </strong>
            <a className="p small nobel pl-xs-5 active">projects</a>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3 col-xs-12">
            <a className="p xl" href="#"><span className="icon-projects mr-xs-15"></span>projects</a>
          </div>
          <div className="col-sm-4 col-xs-12">
            <select className="form-control" id="sel1" value={curSection} onChange={(e) => loadData(e.target.value)}>
              <option value="">Choose a section</option>
              {sections && sections.length > 0 && 
                sections.map((section, index) => {
                  return (
                    <option
                      key={index}
                      value={section["Id"]}>
                      {section["Title"]}
                    </option>
                  )
                })
              }
            </select>
          </div>
          <div className="col-sm-5 col-xs-12 text-right">
            <a href="#" className={`icon-grid inline-block option-grid ${view === 'grid' ? 'active' : '' }`} onClick={() => changeViewTo('grid')}></a>
            <a href="#" className={`icon-list inline-block option-grid ${view === 'list' ? 'active' : '' }`} onClick={() => changeViewTo('list')}></a>
          </div>
        </div>
        {curSection > 0 &&
          <div className="container mt-sm-50 mt-xs-30">
            { view === "grid" &&
              <div className="uk-sortable-nodrag col-sm-4 col-xs-12">
                <a
                  className="relative block"
                  onClick={() => {navigate('/dashboard/articles/add/' + curSection,
                    {
                      state: { 
                        sectionSlug: sections.find(section => section.Id.toString() === curSection.toString())?.Slug 
                      }
                    }
                  )}}>
                  <div className="relative block ar-lg-70 ar-xs-75 border-ebebeb upload-big hover-opacity overflow-hidden hover-opacity">
                    <div className="css3-middle-center">
                      <span className="icon-upload"></span>
                    </div>
                  </div>
                  <div className="pt-sm-45 pt-xs-40 h115">
                    <p className="large">create a new project</p>
                  </div>
                </a>
              </div>
            }
            { view === "list" &&
              <div className="uk-sortable-nodrag col-sm-12 col-xs-12">
                <a className="row block m-0"
                  onClick={() => {navigate('/dashboard/articles/add/' + curSection,
                    {
                      state: { 
                        sectionSlug: sections.find(section => section.Id.toString() === curSection.toString())?.Slug 
                      }
                    }
                  )}}>
                  <div className="row-xs-height border-outline-ebebeb border-0 p-0 m-0">
                    <div className="col-lg-2 col-sm-3 relative pl-sm-0  col-xs-height col-xs-middle">
                      <div className="relative block ar-lg-65 ar-xs-65 upload-big hover-opacity overflow-hidden hover-opacity">
                        <div className="css3-middle-center">
                          <span className="icon-upload"></span>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-10 col-sm-3 relative col-xs-height col-xs-middle">
                      <p className="large">create a new project</p>
                    </div>
                  </div>
                </a>
              </div>
            }
            <div className="row column">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}>
                <SortableContext
                  items={articles}
                  strategy={rectSortingStrategy}>
                  { articles.length > 0 &&
                    articles.map((article, index) => {
                      return (
                        // <div 
                        //   key={index} 
                        //   className={view === 'list' ? "col-sm-12 col-xs-12" : "col-sm-3 col-xs-12 mb-lg-60 mb-md-50 mb-sm-40 mb-xs-30"}
                        // >
                          <ProductItem 
                            key={index}
                            article={article} 
                            row={index}
                            view={view} 
                            sectionId={curSection} 
                            slug={sections.find(section => section.Id.toString() === curSection.toString())?.Slug} 
                            setShowModal={handleModal} 
                            setLoaded={handleLoaded}
                          />
                        // </div>
                      )
                    })
                  }
                </SortableContext>
                {/* <DragOverlay adjustScale style={{ transformOrigin: '0 0 ' }}>
                  {activeId ? <Item id={activeId} isDragging /> : null}
                </DragOverlay> */}
              </DndContext>
            </div>
          </div>
        }
        <Modal show={showModal} onClose={() => setShowModal(false)} id={articleId}/>
      </div>
    </>
  )
}

export default Dashboard;