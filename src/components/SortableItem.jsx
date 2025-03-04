import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import SectionItem, { sectionValues } from '../components/SectionItem';

function SortableItem ({ section, index, onDelete, onUpdate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `section-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSectionUpdate = (updatedSection) => {
    if (JSON.stringify(section) !== JSON.stringify(updatedSection)) {
      onUpdate(index, updatedSection);
    }
  };

  return (
    <li ref={setNodeRef} style={style} >
      <div className="container mt-lg-50 mt-md-40 mt-sm-30 mt-xs-25">
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <div className="relative overflow-hidden line-container d-flex justify-content-between">
              <p className="small black pull-left bg-white relative pr-xs-10">
                section {index + 1}
              </p>
              <div className="line bg-dusty-gray"></div>
              <div>
                <p 
                  className="icon-move pull-right bg-white relative pl-xs-15"
                  {...attributes} {...listeners}
                  style={{ cursor: 'grab' }}
                >
                  move
                </p>
                <p
                  onClick={() => onDelete(index)} 
                  className="icon-close pull-right bg-white relative ps-4"
                  style={{ cursor: 'pointer' }}
                >
                  delete
                </p>
              </div>
            </div>
          </div>
        </div>
        <SectionItem sectionKey={index} sectionDetail={section} onUpdate={handleSectionUpdate}/>
      </div>
    </li>
  );
}

export default SortableItem