import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import axios from "axios";

import { CSS } from '@dnd-kit/utilities';
import { useAuth } from "../context/auth";
import SectionItem, { sectionValues } from '../components/SectionItem';
import SortableItem from '../components/SortableItem';

const articleValue = {
  title: "",
  subtitle: "",
  bgcolor: "",
  awards: "",
  mainpic: "",
  hoverpic: "",
  background: "black",
  types: [],
  slug: "",
  date: format(new Date(), 'dd.M.yyyy'),
  published: 1,
  pdf: "",
  footer: ""
}

function AddEditArticle() {
  let auth = useAuth()
  let navigate = useNavigate();
  const location = useLocation();
  const sectionSlug = location.state?.sectionSlug;
  const { section_id, article_id } = useParams();
  const [articleData, setArticleData] = useState(undefined);
  const [articleId, setArticleId] = useState(article_id || "");
  const [awards, setAwards] = useState([]);
  const [selectedAwards, setSelectedAwards] = useState([]);
  const [sections, setSections] = useState([]);
  const [articleInfo, setArticleInfo] = useState(articleValue);
  const [error, setError] = useState("");
  const [isAddSection, setIsAddSection] = useState(false)
  const [uploadingList, setUploadingList] = useState(false);
  const [mainPicInfo, setmainPicInfo] = useState(undefined);
  const [hoverPicInfo, setHoverPicInfo] = useState(undefined);
  const [isMoveSection, setIsMoveSection] = useState(false);

  const [collapsedPanels, setCollapsedPanels] = useState({
    slug: true,
    date: true,
    published: true,
    pdf: true
  });

  const [slugCheck, setSlugCheck] = useState({ loading: false, valid: false, exist: false })

  const form = useFormik({
    initialValues: {
      published: "",
      pdf: "",
      title: "",
      subtitle: "",
      mainpic: "",
      hoverpic: "",
      awards: selectedAwards,
      background: "",
      bgcolor: "",
      footer: "",
      slug: "",
      date: "",
      types: []
    },
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      handleSubmit();
    }
  })

  // Add handler for toggling panels
  const togglePanel = (panelName) => {
    setCollapsedPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const updateArticleInfo = (item, value) => {
    setArticleInfo(prev => ({
      ...prev,
      [item]: value
    }))
  }

  const fetchAwards = () => {
    let formData = {}
    formData.action = "getCategories";
    fetch(`/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler`, {
      method: "POST",
      headers: { Auth: auth.user.token},
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      setAwards(data)
    })
  }

  const fetchArticle = () => {
    let formData = {}
    formData.action = "getData"
    formData.uri = "/articles/" + articleId
    fetch(`/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler`, {
      method: "POST",
      headers: { Auth: auth.user.token},
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        // Parse the HTML data
        setArticleData(data)
        let html = JSON.parse(data["Html"])
        // Update article info
        setArticleInfo(prev => ({
          title: html.title || "",
          subtitle: html.subtitle || "",
          bgcolor: html.bgcolor || "",
          awards: html.awards || [],
          mainpic: html.mainpic || "",
          hoverpic: html.hoverpic || "",
          background: html.background || "black",
          types: html.types || [],
          slug: html.slug || "",
          date: html.date || format(new Date(), 'dd.M.yyyy'),
          published: html.published,
          pdf: html.pdf || "",
          footer: html.footer || ""
        }));

        // Set selected awards if they exist
        if (html.awards) {
          let temp = html.awards.split(",")
          setSelectedAwards(temp);
        }

        // Set image previews if they exist
        if (html.mainpic) {
          let mainpic = JSON.parse(html.mainpic)
          if (mainpic && mainpic["SourcePath"])
          setmainPicInfo(mainpic);
        }

        if (html.hoverpic) {
          let hoverpic = JSON.parse(html.hoverpic)
          if (hoverpic && hoverpic["SourcePath"]) {
            setHoverPicInfo(hoverpic);
          }
        }

        if (html.types && Array.isArray(html.types)) {
          setSections(html.types)
        }

        checkSlug(html.slug)
      }
    })
    .catch(error => {
      console.error('Error fetching article:', error);
      setError('Failed to load article data');
    });
  }

  const checkSlug = (slug) => {
    setSlugCheck({
      loading: true,
      valid: false,
      exist: false
    })
    let formData = {}
    formData.action = "postData"
    formData.uri = "/articles/validate"
    formData.data = {
      "Slug": slug,
      "_embedded": {
        "Section": { "Id": section_id },
        "Language": { "Id": 1 }
      }
    }

    fetch(`/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler`, {
      method: "POST",
      headers: { Auth: auth.user.token},
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        setSlugCheck({
          loading: false,
          valid: true,
          exist: false
        })
      }
    })
    .catch(error => {
      setSlugCheck({
        loading: false,
        valid: false,
        exist: false
      })
      console.error('Error checking the slug:', error);
      // setError('Failed to load article data');
    });
  }

  useEffect(() => {
    fetchAwards()
  },[])

  useEffect(() => {
    if (article_id) {
      setArticleId(article_id)
      fetchArticle()
    }
  }, [article_id])

  // Update form values when articleInfo changes
  useEffect(() => {
    if (articleInfo) {
      form.setValues({
        title: articleInfo.title,
        subtitle: articleInfo.subtitle,
        bgcolor: articleInfo.bgcolor,
        awards: articleInfo.awards.length === 0 ? "" : articleInfo.awards ,
        mainpic: articleInfo.mainpic ? JSON.stringify(articleInfo.mainpic) : "",
        hoverpic: articleInfo.hoverpic ? JSON.stringify(articleInfo.hoverpic) : "",
        background: articleInfo.background,
        types: articleInfo.types,
        slug: articleInfo.slug,
        published: articleInfo.published,
        pdf: articleInfo.pdf,
        footer: articleInfo.footer
      });
    }
  }, [articleInfo]);

  const handleSubmit = () => {
    const reqData = {
      "Active": form.values.published,
      "Title": form.values.title,
      "Description": articleData?.["Description"] || "",
      "Html": JSON.stringify(form.values),
      "PageTitle": form.values.title,
      "Slug": form.values.slug,
      "Searchable": true,
      "MetaTagKeywords": form.values.title,
      "MetaTagDescription": form.values.title,
      "StartDate": "",
      "DisplayDate": format(new Date(), 'yyyy-MM-dd'),
      "EndDate": "",
      "SortOrder": articleData?.["SortOrder"] || 0,
      "Invisible": false,
      "_locale": 'en_CA',
      "_embedded":{
          "Language":{
            "Id": 1,
          },
          "Section":{
            "Id": section_id
          }
      }
    }

    let formData = {}
    formData.action = articleId ? "putData" : "postData"
    formData.uri = articleId ? "/articles/" + articleId : "/articles/"
    formData.data = reqData

    fetch(`/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler`, {
      method: "POST",
      headers: { Auth: auth.user.token},
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      navigate("/dashboard/list")
    })
    .catch(error => {
      console.error('Error saving article:', error);
      setError('Failed to save article data');
    });
  }

  const addSectionRow = () => {
    setIsAddSection(true)
  }

  const deleteSectionRow = (indexToDelete) => {
    setSections(prevSections => {
      let newSections = prevSections.filter((_, index) => index !== indexToDelete)
      updateArticleInfo("types", newSections);
      return newSections;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    setIsMoveSection(true)
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = parseInt(active.id.split('-')[1]);
        const newIndex = parseInt(over.id.split('-')[1]);
        const newArray = arrayMove(items, oldIndex, newIndex);
        updateArticleInfo("types", newArray)
        return newArray
      });
    }
  };

  const handleAwardToggle = (award) => {
    setSelectedAwards(prev => {
      let newAwards;
      if (prev.length === 0) {
        newAwards = [award.toString()];
      } else {
        const isSelected = prev.some(a => a.toString() === award.toString());
        if (isSelected) {
          newAwards = prev.filter(a => a.toString() !== award.toString());
        } else {
          newAwards = [...prev, award.toString()];
        }
      }
      // Convert array to comma-separated string
      const awardsString = newAwards.join(',');
      // Update article info with the string
      updateArticleInfo('awards', awardsString);
      return newAwards;
    });
  };

  const updateSectionRow = (index, updatedSection) => {
    // console.log(isMoveSection)
    if (!isMoveSection) {
      console.log(isMoveSection)
      setSections(prevSections => {
        const newSections = [...prevSections];
        newSections[index] = {
          ...newSections[index],
          ...updatedSection
        };
        updateArticleInfo("types", newSections)
        return newSections;
      });
    }
  };

  const handlePicUpload = async (e, field_name) => {
    e.preventDefault();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setUploadingList(true);
        const reader = new FileReader();
        reader.onload = () => {
          if (field_name === "mainpic") {
            setmainPicInfo(prev => ({
              ...prev,
              title: file.name,
              SourcePath: reader.result
            }))
          } else {
            setHoverPicInfo(prev => ({
              ...prev,
              title: file.name,
              SourcePath: reader.result
            }))
          }
          
          uploadFile(reader.result, file.name, file.type, field_name)
        }

        reader.readAsDataURL(file)
      } catch (error) {
        setError('Error uploading image');
        console.error('Upload error:', error);
      } finally {
        setUploadingList(false);
      }
    };

    fileInput.click();
  };

  const handleDeletePic = async(e, field_name) => {
    e.preventDefault();
    try {
      // Get the file info based on field name
      const fileInfo = field_name === "mainpic" ? mainPicInfo : hoverPicInfo;
      if (!fileInfo || !fileInfo.SourcePath) return;
      let formData = {}
      formData.action = "deleteData"
      formData.uri = "/files/" + fileInfo.Id
      // Make API call to delete the file
      const response = await fetch("/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler", {
        method: 'POST',
        headers: { Auth: auth.user.token},
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        throw new Error('Delete failed');
      }
  
      // Clear the file info from state
      if (field_name === "mainpic") {
        setmainPicInfo("");
      } else {
        setHoverPicInfo("");
      }
  
      // Clear the file info from article info
      updateArticleInfo(field_name, "");
      setError('');
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const uploadFile = async (file, file_name, file_type, field_name) => {
    let base64_image_content = file.replace(/^data:image\/(png|jpg|jpeg|webp|svg+xml);base64,/, "");
    let image_to_upload = base64ToBlob(base64_image_content, file_type);   
    // upload file
    let formData = new FormData();
    let random_id = Math.floor(Math.random() * 9999) + 1;
    formData.append("overwrite",0);
    formData.append("unzip",0);
    formData.append("files[]",image_to_upload,file_name);

    const response = await axios.post("/api/files/", formData, {
      headers: {
        "xpr-token-frontend": auth.user.token,
        "x-xsrf-token": auth.user.xsrf_token,
        "Content-Type": "multipart/form-data"
    },
      withCredentials: true
    })

    const data = await response.json();
    console.log(data)
    if (data.success) {
      // Update article info with new image path
      updateArticleInfo(field_name, JSON.stringify(data));
      // Show preview
      if (field_name === "mainpic") {
        setmainPicInfo(prev => ({
          ...prev,
          SourcePath: data["SourcePath"]
        }))
      } else {
        setHoverPicInfo(prev => ({
          ...prev,
          SourcePath: data["SourcePath"]
        }))
      }
    } else {
      setError(data.message || 'Failed to upload image');
    }
  }

  const base64ToBlob = (base64, mime) => {
    mime = mime || "";
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];
    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) { var slice = byteChars.slice(offset, offset + sliceSize);var byteNumbers = new Array(slice.length);for (var i = 0; i < slice.length; i++) { byteNumbers[i] = slice.charCodeAt(i); }var byteArray = new Uint8Array(byteNumbers);byteArrays.push(byteArray); }
    return new Blob(byteArrays, {type: mime});
}

  useEffect(() => {
    if (isAddSection) {
      const temp = sections
      temp.push(sectionValues)
      setSections(temp)
      setIsAddSection(false)
    }
  }, [sections, isAddSection])

  return (
    <form onSubmit={form.handleSubmit} encType="multipart/form-data" method="POST">
      {/* Title & background */}
      <div className="container">
        {/* Breadcrumb */}
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <a href="#" className="p small gallery">projects</a>
            <span className="p small gallery"> / </span>
            {articleId !== "" && <a href="#" className="p small">{articleInfo.title}</a>}
            {articleId === "" && <a href="#" className="p small">New project</a>}
          </div>
        </div>

        {/* Project Title */}
        <div className="row mt-lg-85 mt-md-75 mt-sm-65 mt-xs-45">
          <div className="col-sm-2 col-lg-1">
            <p className="small">title</p>
          </div>
          <div className="col-sm-10 col-lg-11">
            <input type="text" className="form-control-no big" name="title" value={articleInfo.title}
            onChange={e => {
              e.preventDefault()
              updateArticleInfo('title', e.target.value)
            }
            }/>
          </div>
        </div>

        <div className="row mt-lg-85 mt-md-75 mt-sm-65 mt-xs-45">
          <div className="col-sm-2 col-lg-1">
            <p className="small">subtitle</p>
          </div>
          <div className="col-sm-10 col-lg-11">
            <input type="text" className="form-control-no big" name="title" value={articleInfo.subtitle}
              onChange={ e => {
                e.preventDefault()
                updateArticleInfo('subtitle', e.target.value)
              }
            }
            />
          </div>
        </div>

        <div className="row mt-lg-85 mt-md-75 mt-sm-65 mt-xs-45">
          <div className="col-sm-2">
            <p className="small">background color (HEX)</p>
          </div>
          <div className="col-sm-10">
            <input type="text" className="form-control-no big" style={{width: '50%'}} name="bgcolor" value={articleInfo.bgcolor}
              onChange={ e => {
                e.preventDefault()
                updateArticleInfo('bgcolor', e.target.value)
              }
            }
            />
          </div>
        </div>

        <div className="row mt-lg-85 mt-md-75 mt-sm-65 mt-xs-45">
          <div className="col-sm-2 col-lg-1">
            <p className="small">Awards</p>
          </div>
          <div className="col-sm-10 col-lg-11">
            <input type="text" className="hide form-control-no big" name="title" />
            {awards.length > 0 &&
            awards.map((award, index) => {
              const isSelected = selectedAwards?.some(a => a.toString() === award.Id.toString());
              return (
                <div 
                  key={index} 
                  className={`form-group awards ${isSelected ? "awardsChecked" : ""}`}
                  style={{ cursor: 'pointer' }}
                >
                  <label htmlFor={award.Name}>{award.Name}</label>
                  <input 
                    type="checkbox"
                    className="hide" 
                    id={award.Name}
                    checked={isSelected}
                    onChange={() => handleAwardToggle(award.Id)} // Required to avoid React warning
                  />
                </div>
              );
            })
          }
          </div>
        </div>

        <div className="row mt-lg-85 mt-md-75 mt-sm-65 mt-xs-45 mainpic" style={{marginTop: '72px'}}>
          <div className="col-sm-2 col-lg-1">
            <p className="small">List image</p>
          </div>
          <div className="col-sm-10 col-lg-11">
            <input type="text" className="form-control-no big hide" name="title"/>
            { uploadingList && <div className="loading alias" style={{right: '300px', top: '56px'}}></div>}
            { mainPicInfo === undefined && uploadingList === false && <button 
              className="button p small block" 
              style={{textDecoration: 'underline', position: 'relative', left: '33px'}}
              onClick={e => handlePicUpload(e, "mainpic")}
              disabled={uploadingList}>
                Upload image
            </button>}
            {mainPicInfo && 
              <div style={{position: 'relative', top: '-34px', left: '40px'}}>
                <img style={{width: '136px'}} src={mainPicInfo["SourcePath"]} ></img>
                <p style={{color: '#aaa'}}>{mainPicInfo["title"]}</p>
                <p
                  className="icon-close pull-right bg-white relative m-0" 
                  style={{float: 'left', textAlign: 'left', fontSize: '15px'}}
                  onClick={e => handleDeletePic(e, "mainpic")}>
                  delete file
                </p>
              </div>
            }
          </div>
        </div>

        <div className="row mt-lg-85 mt-md-75 mt-sm-65 mt-xs-45 hoverpic" style={{marginTop: '72px'}}>
          <div className="col-sm-2 col-lg-1">
            <p className="small">Hover image</p>
          </div>
          <div className="col-sm-10 col-lg-11">
            <input type="text" className="form-control-no big hide" name="title"/>
            { uploadingList && <div className="loading alias" style={{right: '300px', top: '56px'}}></div>}
            {hoverPicInfo === undefined && uploadingList === false &&
                <button 
                  className="button p small block" 
                  style={{textDecoration: 'underline', position: 'relative', left: '33px'}}
                  onClick={e => handlePicUpload(e, "hoverpic")}
                  disabled={uploadingList}
                >Upload image
              </button>}
            {hoverPicInfo && <div style={{position: 'relative', top: '-34px', left: '40px'}}>
              <img style={{width: '136px'}} src={hoverPicInfo["SourcePath"]}></img>
              <p style={{color: '#aaa'}}>{hoverPicInfo["title"]}</p>
              <p 
                className="icon-close pull-right bg-white relative m-0" 
                style={{float: 'left', textAlign: 'left', fontSize: '15px'}}
                onClick={e => handleDeletePic(e, "hoverpic")}
              >
                delete file</p>
            </div>}
          </div>
        </div>
        
        <div className="row">
          <input type="text" className="hide" name="background" />
          <div className="col-sm-12 col-xs-12 mt-lg-45 mt-md-40 mt-sm-35 mt-xs-25">
            <p className="small">background</p>
          </div>

          <div className="col-sm-12 col-xs-12 mt-lg-60 mt-md-50 mt-sm-40 mt-xs-30">
            <a
              onClick={e => 
              {
                e.preventDefault()
                updateArticleInfo('background', 'black');
              }
              }
              className={`project-bacground relative inline-block w50 bg-black border-ebebeb ar-sm-10 ar-xs-20 pull-left ${articleInfo["background"] === "black" ? "active" : ""}`}>
              <span className="icon-ok white css3-middle-center"></span>
            </a>
            <a
              onClick={e => 
                {
                  e.preventDefault()
                  updateArticleInfo('background', 'white');
                }
                }
              className={`project-bacground relative inline-block w50 bg-white border-ebebeb ar-sm-10 ar-xs-20 pull-left ${articleInfo["background"] === "white" ? "active" : ""}`}>
              <span className="icon-ok black css3-middle-center"></span>
            </a>
            <div className="clearfix"></div>
          </div>
        </div>
      </div>
      {/* Sections */}
      <div className="content-type">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext
              items={sections.map((_, index) => `section-${index}`)}
              strategy={verticalListSortingStrategy}>
              <ul className="container">
                {sections.length > 0 &&
                  sections.map((section, index) => (
                    <SortableItem
                      key={`section-${index}`}
                      section={section}
                      index={index}
                      onDelete={deleteSectionRow}
                      onUpdate={updateSectionRow}
                    />
                  ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>

        {/* Add section & office */}
        <div className="container">
          <div className="row mt-lg-70 mt-sm-60 mt-xs-50">
            <div className="col-sm-12 col-xs-12">
              <div className="line-text">
                <p className="small black add-content-type" onClick={addSectionRow}><span className="icon-add-section"></span> Add section</p>
              </div>
            </div>
          </div>
        </div>

        {/* URL and Date */}
        <div className="bg-gallery-20 mt-lg-140 mt-sm-100 mt-xs-70">
          <div className="container">
            <div className="row mt-lg-70 mt-sm-60 mt-xs-40 mb-lg-60 mb-sm-50 mb-xs-30 justify-content-center py-5">
              <div className="col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0 py-3">
                <div className="row">
                  {/* URL alias */}
                  <div className="col-sm-6 col-xs-12">
                    <div id="group-3" className="panel-group">
                      <div className="panel-custom">
                        <div className="panel-heading">
                          <a 
                            onClick={(e) => {
                              e.preventDefault();
                              togglePanel('slug');
                            }}
                            className={`p small ${collapsedPanels.slug ? "collapsed" : ""}`}>
                            <span className={`icon-${collapsedPanels.slug ? "less" : "more"}`}></span> URL alias
                          </a>
                        </div>
                        <div id="id-6" className={`panel-collapse collapse ${collapsedPanels.slug ? "in" : ""}`}>
                          <div className="panel-body">
                            <div className="form-group relative">
                              <div className={`alias ${
                                slugCheck.loading ? 'loading' : 
                                slugCheck.valid ? 'valid' :
                                slugCheck.exist ? 'exist' : 
                                ''
                              }`}></div>
                              <input type="text" className="form-control-no pb-xs-10" value={articleInfo.slug} 
                                onChange={e => {
                                  updateArticleInfo('slug', e.target.value);
                                  checkSlug(e.target.value);
                                }}  
                              />
                              <a className="p small">
                                <br />http://www.mousegraphics.eu/{sectionSlug}/{articleInfo.slug}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Last edited */}
                  <div className="col-sm-6 col-xs-12">
                    <div id="group-4" className="panel-group">
                      <div className="panel-custom">
                        <div className="panel-heading">
                          <a 
                            onClick={(e) => {
                              e.preventDefault();
                              togglePanel('date');
                            }}
                            className={`p small ${collapsedPanels.date ? "collapsed" : ""}`}>
                            <span className={`icon-${collapsedPanels.date ? "less" : "more"}`}></span> last edited
                          </a>
                        </div>
                        <div id="id-7" className={`panel-collapse collapse ${collapsedPanels.date ? "in" : ""}`}>
                          <div className="panel-body">
                            <div className="form-group">
                              <input type="text" className="form-control-no pb-xs-10" value={articleInfo["date"]} disabled />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Publish */}
                  <div className="col-sm-6 col-xs-12">
                    <div id="group-5" className="panel-group">
                      <div className="panel-custom">
                        <div className="panel-heading">
                          <a 
                            onClick={(e) => {
                              e.preventDefault();
                              togglePanel('published');
                            }}
                            className={`p small ${collapsedPanels.published ? "collapsed" : ""}`}>
                            <span className={`icon-${collapsedPanels.published ? "less" : "more"}`}></span> Published
                          </a>
                        </div>
                        <div id="id-11" className={`panel-collapse collapse ${collapsedPanels.published ? "in" : ""}`}>
                          <div className="panel-body">
                            <a
                              onClick={e => {
                                e.preventDefault()
                                updateArticleInfo('published', 1);
                              }}
                              className={`office p small text-center pt-lg-20 pb-lg-20 pt-sm-15 pb-sm-15 pt-xs-10 pb-xs-10 w50 inline-block pull-left border-ebebeb bg-gallery-20 nobel ${articleInfo.published === 1 ? "active" : ""}`}>Yes</a>
                            <a
                              onClick={e => {
                                e.preventDefault()
                                updateArticleInfo('published', 0);
                              }}
                              className={`office p small text-center pt-lg-20 pb-lg-20 pt-sm-15 pb-sm-15 pt-xs-10 pb-xs-10 w50 inline-block pull-left border-ebebeb bg-gallery-20 nobel ${articleInfo.published === 0 ? "active" : ""}`}>No</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* pdf */}
                  <div className="col-sm-6 col-xs-12">
                    <div id="group-12" className="panel-group">
                      <div className="panel-custom">
                        <div className="panel-heading">
                          <a 
                            onClick={(e) => {
                              e.preventDefault();
                              togglePanel('pdf');
                            }}
                            className={`p small ${collapsedPanels.pdf ? "collapsed" : ""}`}>
                            <span className={`icon-${collapsedPanels.pdf ? "less" : "more"}`}></span> Pdf Presentation
                          </a>
                        </div>
                        <div id="id-13"  className={`panel-collapse collapse ${collapsedPanels.pdf ? "in" : ""}`}>
                          <div className="panel-body">
                            <div className="form-group">
                              <div
                                style={{right: '300px', top: '56px'}}
                                className="loading hide alias"></div>
                                <button
                                  style={{textDecoration: 'underline', position: 'relative', top: '20px', left: '33px'}}
                                  className="button p small block">
                                  Upload File
                                </button>
                              <input type="text" className="form-control-no hide" />
                              <div ></div>
                              {articleInfo["pdf"] && 
                                <div style={{position: 'relative', top: '7px', left: '40px'}}>
                                  <p>
                                    <span style={{color: '#aaa'}}> (File size:  )</span>
                                  </p>
                                  <p
                                    className="icon-close pull-right bg-white relative pl-xs-15 p-0 m-0"
                                    style={{float: 'left', textAlign: 'left', fontSize: '15px'}}>
                                    delete file
                                  </p>
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Save or Cancel */}
        <div className="container save">
          <div className="row mt-lg-70 mt-sm-60 mt-xs-50 mb-lg-100 mb-sm-70 mb-xs-50">
            <div className="col-sm-12 col-xs-12 text-center">
              {error && 
                <div className="alert alert-warning">
                  There was an error while trying to save your data. <br/> Please check your inputs again.
                </div>
              }
              <div className="inline-block save-or-cancel">
                <button
                  type="submit" 
                  className="button p xl dove-gray normal block border-bottom-ebebeb pb-xs-5">
                  save &amp; exit
                </button>
                <div className="mt-lg-30 mt-sm-20 mt-xs-15"></div>
                <button 
                  type="button" 
                  className="button p small block" 
                  onClick={() => {navigate("/dashboard/list")}}>
                  cancel
                </button>
              </div>
            </div>
          </div>
        </div>
    </form>
  );
}

export default AddEditArticle;