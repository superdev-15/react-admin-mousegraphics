import { useState, useEffect, useRef } from "react";
import Quill from "quill";
import 'react-quill/dist/quill.snow.css';
import { useAuth } from "../context/auth";

export const sectionValues = {
  'type': '',
  'image-image-file': '',
  'image-image-descr': '',
  'video-image-file': '',
  'video-image-descr': '',
  'video-video-file1': '',
  'video-video-file2': '',
  'video-vimeo': '',
  'video-youtube': '',
  'slider-image1-file': '',
  'slider-image1-descr': '',
  'slider-image2-file': '',
  'slider-image2-descr': '',
  'subtitle': '',
  'main-descr': '',
  'sub-descr': '',
  'pdf': '',
  'background-color': '',
  'font-color': 'black'
}

function SectionItem (props) {
  let auth = useAuth()
  let visualTypes = ["image", "video", "slider"]

  const toolbarOptions = [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, 
     {'indent': '-1'}, {'indent': '+1'}],
    [{ 'color': [] }, { 'background': [] }],  
    ['link', 'image'],
    ['clean']
  ];
  
  const mainEditorRef = useRef(null);
  const subEditorRef = useRef(null);

  const { sectionKey, sectionDetail, onUpdate } = props
  const [curSectionDetail, setCurSectionDetail] = useState(sectionDetail)
  const [errorMsg, setErrorMsg] = useState("")
  const [curVisualType, setCurVisualType] = useState("")
  const [fileUploaded, setFileUploaded] = useState(false)

  const [collapsedPanels, setCollapsedPanels] = useState({
    visual: true,
    subTitle: false,
    mainDescription: false,
    subDescription: false,
    highResImages: false,
    colors: false
  });

  useEffect(() => {
      if (JSON.stringify(sectionDetail) !== JSON.stringify(curSectionDetail)) {
        const sectionInfo = curSectionDetail
        const newSectionInfo = {
          ...sectionInfo,
          "image-image-file": sectionInfo["image-image-file"] ? JSON.stringify(sectionInfo["image-image-file"]) : "",
          "slider-image1-file": sectionInfo["slider-image1-file"] ? JSON.stringify(sectionInfo["slider-image1-file"]) : "",
          "slider-image2-file": sectionInfo["slider-image2-file"] ? JSON.stringify(sectionInfo["slider-image2-file"]) : "",
          "video-image-file": sectionInfo["video-image-file"] ? JSON.stringify(sectionInfo["video-image-file"]) : "",
          "video-video-file1": sectionInfo["video-video-file1"] ? JSON.stringify(curSectionDetail["video-video-file1"]) : "",
          "video-video-file2": sectionInfo["video-video-file2"] ? JSON.stringify(curSectionDetail["video-video-file2"]) : ""
        }
        onUpdate(newSectionInfo);   
      } 
  }, [curSectionDetail, sectionDetail]);

  useEffect(() => {
    if (mainEditorRef.current && !mainEditorRef.current.querySelector('.ql-editor')) {
      const mainQuill = new Quill(mainEditorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        }
      });

      // Set initial content if any
      if (curSectionDetail["main-descr"]) {
        mainQuill.root.innerHTML = decodeURI(curSectionDetail["main-descr"]);
      }

      // Handle content changes
      mainQuill.on('text-change', () => {
        updateSectionDetail("main-descr", encodeURI(mainQuill.root.innerHTML.replace(/"/g, "'")));
      });
    }

    if (subEditorRef.current && !subEditorRef.current.querySelector('.ql-editor')) {
      const subQuill = new Quill(subEditorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        }
      });

      // Set initial content if any
      if (curSectionDetail["sub-descr"]) {
        subQuill.root.innerHTML = decodeURI(curSectionDetail["sub-descr"]);
      }

      // Handle content changes
      subQuill.on('text-change', () => {
        updateSectionDetail("sub-descr", encodeURI(subQuill.root.innerHTML.replace(/"/g, "'")));
      });
    }
  }, []);

  useEffect(() => {
    if (sectionDetail) {
      setCurVisualType(sectionDetail["type"])
      setCurSectionDetail(prev => ({
        ...prev,
        "image-image-file": sectionDetail["image-image-file"] ? JSON.parse(sectionDetail["image-image-file"]) : "",
        "slider-image1-file": sectionDetail["slider-image1-file"] ? JSON.parse(sectionDetail["slider-image1-file"]) : "",
        "slider-image2-file": sectionDetail["slider-image2-file"] ? JSON.parse(sectionDetail["slider-image2-file"]) : "",
        "video-image-file": sectionDetail["video-image-file"] ? JSON.parse(sectionDetail["video-image-file"]) : "",
        "video-video-file1": sectionDetail["video-video-file1"] ? JSON.parse(sectionDetail["video-video-file1"]) : "",
        "video-video-file2": sectionDetail["video-video-file2"] ? JSON.parse(sectionDetail["video-video-file2"]) : ""
      }))
    }
  }, [sectionDetail])

  const togglePanel = (panelName) => {
    setCollapsedPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const handleVisualTypeChange = (type) => {
    setCurVisualType(type)
  }

  const deleteFile = async (type) => {
    try {
      // Get the file path from the current section detail
      const fileId = curSectionDetail[type].Id;
      
      let formData = {}
      formData.action = "deleteData"
      formData.uri = "/files/" + fileId

      // Make API call to delete the file
      const response = await fetch("/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler", {
        method: 'POST',
        headers: { Auth: auth.user.token},
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        throw new Error('Delete failed');
      }
  
      // Create a copy of current section detail
      const updatedSectionDetail = { ...curSectionDetail };
      
      // Clear the specific file data
      updatedSectionDetail[type] = '';
      
      // If it's a video type, also clear the description
      if (type === 'video-image-file') {
        updatedSectionDetail['video-image-descr'] = '';
      } else if (type === 'image-image-file') {
        updatedSectionDetail['image-image-descr'] = '';
      } else if (type === 'slider-image1-file') {
        updatedSectionDetail['slider-image1-descr'] = '';
      } else if (type === 'slider-image2-file') {
        updatedSectionDetail['slider-image2-descr'] = '';
      }
      
      // Update the section detail
      setCurSectionDetail(updatedSectionDetail);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg('Delete failed: ' + error.message);
    }
  };

  const updateSectionDetail = (type, data) => {
    setCurSectionDetail(prev => ({
      ...prev,
      [type]: data
    }))
  }

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setFileUploaded(true);
    const formData = new FormData();
    formData.append("overwrite",0);
    formData.append("unzip",0);
    formData.append('file', file);
  
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        headers: {
          "xpr-token-frontend": auth.user.token,
          "x-xsrf-token": auth.user.xsrf_token,
          "Content-Type": "multipart/form-data"
        },
      });
  
      if (!response.ok) {
        throw new Error('Upload failed');
      }
  
      const data = await response.json();
      
      // Update section detail based on visual type and upload type
      updateSectionDetail(type, data)
      /*switch(curVisualType) {
        case 'image':
          if (type === 'image-image-file') {
            updateSectionDetail('image-image-file', JSON.stringify({
              SourcePath: data.path,
              title: file.name
            }));
          }
          break;
  
        case 'video':
          if (type === 'video-image-file') {
            updateSectionDetail('video-image-file', JSON.stringify({
              SourcePath: data.path,
              title: file.name
            }));
          } else if (type === 'video-video-file1') {
            updateSectionDetail('video-video-file1', JSON.stringify({
              SourcePath: data.path,
              title: file.name
            }));
          } else if (type === 'video-video-file2') {
            updateSectionDetail('video-video-file2', JSON.stringify({
              SourcePath: data.path,
              title: file.name
            }));
          }
          break;
  
        case 'slider':
          if (type === 'slider-image1-file') {
            updateSectionDetail('slider-image1-file', JSON.stringify({
              SourcePath: data.path,
              title: file.name
            }));
          } else if (type === 'slider-image2-file') {
            updateSectionDetail('slider-image2-file', JSON.stringify({
              SourcePath: data.path,
              title: file.name
            }));
          }
          break;
      }

      if (type === "pdf") {
        updateSectionDetail('pdf', {
          path: data.path,
          name: file.name,
          size: file.size
        });
      }*/
  
      setFileUploaded(false);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg('Upload failed: ' + error.message);
      setFileUploaded(false);
    }
  };

  return (
    <div className="row mt-lg-50 mt-sm-40 mt-xs-30" key={sectionKey}>
      <div className="col-sm-12 col-xs-12">
        {errorMsg && <div className="alert alert-warning" >{errorMsg}</div>}
        <div className="panel-group">
          {/* Select Type of section */}
          <div className="panel-custom row justify-content-center">
            <div className="panel-heading col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0 d-flex justify-content-between">
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  togglePanel('visual');
                }}
                className={`p small d-flex align-items-center ${collapsedPanels.visual ? "collapsed" : ""}`}>
                <span className={`icon-${collapsedPanels.visual ? "less" : "more"}`}></span> visual 
                {visualTypes.map((type, index) => {
                  if (curVisualType === type) {
                    return (
                      <span className="breadcrumb-inner ms-1" key={index}> / {type}</span>
                    )
                  }
                })}
              </a>
              <a
                onClick={() => handleVisualTypeChange('')}
                className={`visual-type cursor-pointer p small d-flex align-items-center pull-right ${curVisualType !== '' ? "active" : ""}`}
              >change visual type
                <span className="icon-change pr-xs-0"></span>
              </a>
            </div>

            <div className={`panel-collapse collapse col-sm-12 col-xs-12 ${collapsedPanels.visual ? "in" : ""}`}>
              <div className="panel-body">
                <div className="pb-xs-60 row justify-content-center">
                  <input type="text" className="hide form-control-no"/>

                  {/* First View - Choose Type */}
                  <div className={`choose-type col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0 ${curVisualType === '' ? "active" : ""}`}>
                    <a onClick={() => handleVisualTypeChange("image")} className="type-bacground relative inline-block w33 bg-white border-ebebeb ar-12 pull-left">
                      <span className="icon-image css3-middle-center"></span>
                    </a>
                    <a onClick={() => handleVisualTypeChange("video")} className="type-bacground relative inline-block w33 bg-white border-ebebeb ar-12 pull-left">
                      <span className="icon-slider-1 css3-middle-center"></span>
                    </a>
                    <a onClick={() => handleVisualTypeChange("slider")} className="type-bacground relative inline-block w33 bg-white border-ebebeb ar-12 pull-left">
                      <span className="icon-slider css3-middle-center"></span>
                    </a>
                  </div>

                  {/* Second View - Type Image */}
                  <div className={`selected-type col-sm-12 col-xs-12 ${curVisualType === "image" ? "active" : ""}`}>
                    <div className="row">
                      <div className="col-sm-1 hidden-xs text-center">
                        <span className="icon-image gallery inline-block pt-xs-75"></span>
                      </div>
                      <div className="col-sm-2">
                        <p className="small pb-xs-10 pb-sm-15">thumbnail</p>
                        <div className="relative block ar-lg-70 ar-xs-70 upload-small hover-opacity overflow-hidden border-ebebeb">
                        <input 
                          type="file"
                          className="absolute-full"
                          onChange={(e) => handleFileUpload(e, 'image-image-file')}
                          accept="image/*"
                        />
                          {fileUploaded && <img src="/media/ajax-load.gif" alt="" className="always-center" />}
                          {curSectionDetail["image-image-file"] && <img src={curSectionDetail["image-image-file"]["SourcePath"]} alt="" className="always-center" />}
                          <span className="icon-more css3-middle-center"></span>
                        </div>
                        <p style={{color: '#aaa'}}>{curSectionDetail["image-image-file"]["title"]}</p>
                        {curSectionDetail["image-image-file"] && 
                          <p 
                            onClick={() => deleteFile("image-image-file", true)}
                            className="icon-close pull-right bg-white relative p-0"
                            style={{fontSize: '15px'}}>
                            delete file
                          </p>
                        }
                      </div>
                      <div className="col-sm-8">
                        <p className="small pb-xs-10 pb-sm-15">image description</p>
                        <div className="form-group">
                          <input type="text" className="form-control-no mt-3" onChange={e => {
                            e.preventDefault();
                            updateSectionDetail("image-image-descr", e.target.value)
                          }}/>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Second View - Type Image */}
                  
                  {/* Second View - Type Video */}
                  <div className={`selected-type col-sm-12 col-xs-12 ${curVisualType === "video" ? "active" : ""}`}>
                    <div className="row">
                      <div className="col-sm-1 hidden-xs text-center">
                        <span className="icon-image gallery inline-block pt-xs-75"></span>
                      </div>
                      <div className="col-sm-2">
                        <p className="small pb-xs-10 pb-sm-15">thumbnail</p>
                        <div
                          className="relative block ar-lg-70 ar-xs-70 upload-small hover-opacity overflow-hidden border-ebebeb"
                        >
                          <input 
                            type="file"
                            className="absolute-full"
                            onChange={(e) => handleFileUpload(e, 'video-image-file')}
                            accept="image/*"
                          />
                          {fileUploaded && <img src="/media/ajax-load.gif" alt="" className="always-center" />}
                          {curSectionDetail["video-image-file"] && <img src={curSectionDetail["video-image-file"]["SourcePath"]} alt="" className="always-center" />}
                          <span className="icon-more css3-middle-center"></span>
                        </div>
                        <p style={{color: '#aaa'}}>{curSectionDetail["video-image-file"]["title"]}</p>
                        {curSectionDetail["video-image-file"] && 
                          <p 
                            onClick={() => deleteFile("video-image-file", true)}
                            className="icon-close pull-right bg-white relative p-0"
                            style={{fontSize: '15px'}}>
                            delete file
                          </p>
                        }
                      </div>
                      <div className="col-sm-8">
                        <p className="small pb-xs-10 pb-sm-15">video description</p>
                        <div className="form-group">
                          <input type="text" className="form-control-no mt-3" onChange={e => {
                            e.preventDefault();
                            updateSectionDetail("video-image-descr", e.target.value)
                          }}/>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-lg-30 mt-sm-25 mt-xs-20">
                      <div className="col-sm-1 hidden-xs text-center">
                        <span className="icon-slider-1 gallery inline-block pt-xs-75"></span>
                      </div>
                      <div className="col-sm-2">
                        <p className="small pb-xs-10 pb-sm-15">html5 video (MP4)</p>
                        <div className="relative block ar-lg-70 ar-xs-70 upload-small hover-opacity overflow-hidden border-ebebeb">
                          <input 
                            type="file"
                            className="absolute-full"
                            onChange={(e) => handleFileUpload(e, 'video-video-file1')}
                            accept="video/mp4"
                          />
                          {fileUploaded && <img src="/media/ajax-load.gif" alt="" className="always-center" />}
                          {curSectionDetail["video-video-file1"] && <img src="/media/mp4.png" alt="" className="always-center" />}
                          <span className="icon-more css3-middle-center"></span>
                        </div>
                        <p style={{color: '#aaa'}}>{curSectionDetail["video-video-file1"]}</p>
                        {curSectionDetail["video-video-file1"] && 
                          <p 
                            onClick={() => deleteFile("video-video-file1", true)}
                            className="icon-close pull-right bg-white relative p-0"
                            style={{fontSize: '15px'}}>
                            delete file
                          </p>
                        }
                      </div>

                      <div className="col-sm-2">
                        <p className="small pb-xs-10 pb-sm-15">html5 video (OGG)</p>
                        <div className="relative block ar-lg-70 ar-xs-70 upload-small hover-opacity overflow-hidden border-ebebeb">
                          <input 
                            type="file"
                            className="absolute-full"
                            onChange={(e) => handleFileUpload(e, 'video-video-file2')}
                            accept="video/ogg"
                          />
                          {fileUploaded && <img src="/media/ajax-load.gif" alt="" className="always-center" />}
                          {curSectionDetail["video-video-file2"] && <img src="/media/ogg.png" alt="" className="always-center" />}
                          <span className="icon-more css3-middle-center"></span>
                        </div>
                        <p style={{color: '#aaa'}}>{curSectionDetail["video-video-file2"]}</p>
                        {curSectionDetail["video-video-file2"] && 
                          <p 
                            onClick={() => deleteFile("video-video-file2", true)}
                            className="icon-close pull-right bg-white relative p-0"
                            style={{fontSize: '15px'}}>
                            delete file
                          </p>
                        }
                      </div>
                      <div className="col-sm-6">
                        <div className="row mt-5">
                          <div className="col-sm-12 col-xs-12">
                            <p className="small pb-xs-10 pb-sm-15">or vimeo link</p>
                            <div className="form-group">
                              <input type="text" className="form-control-no" onChange={e => {
                                e.preventDefault();
                                updateSectionDetail("video-vimeo", e.target.value)
                              }} />
                            </div>
                          </div>
                          <div className="col-sm-12 col-xs-12 mt-sm-5 mt-xs-5">
                            <p className="small pb-xs-10 pb-sm-15">or youtube link</p>
                            <div className="form-group">
                              <input type="text" className="form-control-no mt-3" onChange={e => {
                                e.preventDefault();
                                updateSectionDetail("video-youtube", e.target.value)
                              }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Second View - Type Video */}

                  {/* Second View - Type Slider */}
                  <div className={`selected-type col-sm-12 col-xs-12 ${curVisualType === "slider" ? "active" : ""}`}>
                    <div className="row">
                      <div className="col-sm-1 hidden-xs text-center">
                        <span className="icon-slider-2 gallery inline-block pt-xs-75"></span>
                      </div>
                      <div className="col-sm-2">
                        <p className="small pb-xs-10 pb-sm-15">thumbnail 1</p>
                        <div className="relative block ar-lg-70 ar-xs-70 upload-small hover-opacity overflow-hidden border-ebebeb">
                          <input 
                            type="file"
                            className="absolute-full"
                            onChange={(e) => handleFileUpload(e, 'slider-image1-file')}
                            accept="image/*"
                          />
                          {fileUploaded && <img src="/media/ajax-load.gif" alt="" className="always-center" />}
                          {curSectionDetail["slider-image1-file"] && <img src={curSectionDetail["slider-image1-file"]["SourcePath"]} alt="" className="always-center" />}
                          <span className="icon-more css3-middle-center"></span>
                        </div>
                        <p style={{color: '#aaa'}}>{curSectionDetail["slider-image1-file"]["title"]}</p>
                        {curSectionDetail["slider-image1-file"] && 
                          <p 
                            onClick={() => deleteFile("slider-image1-file", true)}
                            className="icon-close pull-right bg-white relative p-0"
                            style={{fontSize: '15px'}}>
                            delete file
                          </p>
                        }
                      </div>
                      <div className="col-sm-8">
                        <p className="small pb-xs-10 pb-sm-15">image description 1</p>
                        <div className="form-group">
                          <input type="text" className="form-control-no mt-3" onChange={e => {
                            e.preventDefault();
                            updateSectionDetail("slider-image1-descr", e.target.value)
                          }}/>
                        </div>
                      </div>
                    </div>
                    <div className="row mt-lg-30 mt-sm-25 mt-xs-20">
                      <div className="col-sm-1 hidden-xs text-center">
                        <span className="icon-slider-3 gallery inline-block pt-xs-75"></span>
                      </div>
                      <div className="col-sm-2">
                        <p className="small pb-xs-10 pb-sm-15">thumbnail 2</p>
                        <div className="relative block ar-lg-70 ar-xs-70 upload-small hover-opacity overflow-hidden border-ebebeb">
                          <input
                            type="file"
                            className="absolute-full"
                            onChange={(e) => handleFileUpload(e, 'slider-image2-file')}
                            accept="image/*"
                          />
                          {fileUploaded && <img src="/media/ajax-load.gif" alt="" className="always-center" />}
                          {curSectionDetail["slider-image2-file"] && <img src={curSectionDetail["slider-image2-file"]} alt="" className="always-center" />}
                          <span className="icon-more css3-middle-center"></span>
                        </div>
                        <p style={{color: '#aaa'}}>{curSectionDetail["slider-image2-file"]}</p>
                        {curSectionDetail["slider-image2-file"] && 
                          <p 
                            onClick={() => deleteFile("slider-image2-file", true)}
                            className="icon-close pull-right bg-white relative p-0"
                            style={{fontSize: '15px'}}>
                            delete file
                          </p>
                        }
                      </div>
                      <div className="col-sm-8">
                        <p className="small pb-xs-10 pb-sm-15">image description 2</p>
                        <div className="form-group">
                          <input type="text" className="form-control-no mt-3" onChange={e => {
                            e.preventDefault();
                            updateSectionDetail("slider-image2-descr", e.target.value)
                          }}/>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Second View - Type Slider */}
                </div>
              </div>
            </div>
          </div>
          {/* /Select Type of section */}

          {/* Subtitle */}
          <div className="panel-custom row justify-content-center">
            <div className="panel-heading col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0">
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  togglePanel('subTitle');
                }}
                className={`p small ${collapsedPanels.subTitle ? "collapsed" : ""}`}>
                <span className={`icon-${collapsedPanels.subTitle ? "less" : "more"}`}></span> subtitle
              </a>
            </div>
            <div className={`panel-collapse collapse col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0 ${collapsedPanels.subTitle ? "in" : ""}`}>
              <div className="panel-body">
                <div className="form-group">
                  <input type="text" className="form-control-no pb-xs-10" onChange={e => {
                    e.preventDefault();
                    updateSectionDetail("subtitle", e.target.value)
                  }}/>
                </div>
              </div>
            </div>
          </div>

          {/* main description */}
          <div className="panel-custom row justify-content-center">
            <div className="panel-heading col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0">
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  togglePanel('mainDescription');
                }}
                className={`p small ${collapsedPanels.mainDescription ? "collapsed" : ""}`}>
                <span className={`icon-${collapsedPanels.mainDescription ? "less" : "more"}`}></span> main description
              </a>
            </div>
            <div className={`panel-collapse collapse col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0 ${collapsedPanels.mainDescription ? "in" : ""}`}>
              <div className="panel-body">
                <div className="form-group">
                  <div 
                    ref={mainEditorRef} 
                    style={{ height: '200px', marginBottom: '50px' }}/>
                </div>
              </div>
            </div>
          </div>

          {/* sub description */}
          <div className="panel-custom row justify-content-center">
            <div className="panel-heading col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0">
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  togglePanel('subDescription');
                }}
                className={`p small ${collapsedPanels.subDescription ? "collapsed" : ""}`}>
                <span className={`icon-${collapsedPanels.subDescription ? "less" : "more"}`}></span> sub description (show more)
              </a>
            </div>
            <div className={`panel-collapse collapse col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0 ${collapsedPanels.subDescription ? "in" : ""}`}>
              <div className="panel-body">
                <div className="form-group">
                  <div 
                    ref={subEditorRef}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* High res images */}
          <div className="panel-custom row justify-content-center">
            <div className="panel-heading col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0">
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  togglePanel('highResImages');
                }}
                className={`p small ${collapsedPanels.highResImages ? "collapsed" : ""}`}>
                <span className={`icon-${collapsedPanels.highResImages ? "less" : "more"}`}></span> High res images
              </a>
            </div>
            <div className={`panel-collapse collapse col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0 ${collapsedPanels.highResImages ? "in" : ""}`}>
              <div className="panel-body">
                <div className="loading hide alias" style={{right: '300px', top: '56px'}}></div>
                {!curSectionDetail["pdf"] && 
                  <div className="relative button p small block upoad-pdf" style={{top: 0}}>
                    <input
                      type="file"
                      className="absolute-full cursor-pointer p-3"
                      onChange={(e) => handleFileUpload(e, "pdf")}
                      accept="application/pdf"
                    /> 
                    <span className="" style={{position: 'relative'}}>Upload File</span>
                  </div>
                }
                {curSectionDetail["pdf"] && 
                  <div style={{position: 'relative', top: '7px', left: '40px'}}>
                    <p>
                      {curSectionDetail["pdf"]}
                      <span style={{color: "#aaa"}}>(File size: {curSectionDetail["pdf"]})</span>
                    </p>
                    <p 
                      onClick={() => deleteFile("pdf", true)}
                      className="icon-close pull-right bg-white relative p-0"
                      style={{fontSize: '15px'}}>
                      delete file
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>

          {/* background color */}
          <div className="panel-custom row justify-content-center">
            <div className="panel-heading col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0">
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  togglePanel('colors');
                }}
                className={`p small ${collapsedPanels.colors ? "collapsed" : ""}`}>
                <span className={`icon-${collapsedPanels.colors ? "less" : "more"}`}></span> Colors
              </a>
            </div>
            <div className={`panel-collapse collapse col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0 ${collapsedPanels.colors ? "in" : ""}`}>
              <div className="panel-body">
                <div className="row">
                  <div className="col-sm-3">
                    <p className="small">background color (HEX)</p>
                  </div>
                  <div className="col-sm-9">
                    <input type="text" style={{width: "70%"}} className="form-control-no big" name="section-background-color" onChange={e => updateSectionDetail("background-color", e.target.value)}/>
                  </div>
                </div>
                <div className="row">
                  <input type="text" className="hide" name="font-color" onChange={e => updateSectionDetail("font-color", e.target.value)}/>
                  <div className="col-sm-12 col-xs-12 mt-lg-35 mt-md-30 mt-sm-25 mt-xs-20">
                    <p className="small">font color</p>
                  </div>
                  <div className="col-sm-12 col-xs-12 mt-lg-35 mt-md-30 mt-sm-25 mt-xs-20">
                    <a 
                      onClick={() => updateSectionDetail("font-color", "black")}
                      className={`project-bacground relative inline-block w50 bg-black border-ebebeb ar-sm-10 ar-xs-20 pull-left ${curSectionDetail["font-color"] === "black" ? "active" : ""}`}>
                      <span className="icon-ok white css3-middle-center"></span>
                    </a>
                    <a 
                      onClick={() => updateSectionDetail("font-color", "white")}
                      className={`project-bacground relative inline-block w50 bg-white border-ebebeb ar-sm-10 ar-xs-20 pull-left ${curSectionDetail["font-color"] === "white" ? "active" : ""}`}>
                      <span className="icon-ok black css3-middle-center"></span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionItem;