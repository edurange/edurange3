
import React, { useContext } from 'react';

import '@assets/css/tables.css';
import CreateGroup from './CreateGroup';
import Instr_GroupTable from './Instr_GroupTable';
import Placard from '@components/Placard';

function Instr_Groups() {

    return (
        <div className='instructor-dash-frame'>
            
            <div className='instructor-dash-column-main'>
                <div className='instructor-dash-section'>
                    <Placard placard_text={"Student Groups"} />
                        <CreateGroup />
                    <div className="table-frame">
                        <Instr_GroupTable />                
                    </div>
                </div>
            </div>

            <div className='instructor-dash-column-alt'>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime saepe deserunt doloremque quod quo laudantium totam dolorum eaque impedit! Reprehenderit molestiae totam incidunt illo, voluptatem laboriosam iure soluta, officia iste nobis cupiditate! Minima inventore nobis dolores dolorem incidunt officiis debitis voluptatum hic quidem iure facere nulla soluta voluptatem possimus consequatur necessitatibus, libero facilis pariatur velit. Ratione ipsa culpa fugiat temporibus. Tempora aspernatur accusamus error pariatur labore exercitationem aliquam fugit voluptatum enim quasi sunt, provident aliquid aut illum soluta officia ex? Quos sed, praesentium placeat eligendi quaerat ad iusto hic sit excepturi earum. Neque ut in dolorum a repudiandae atque alias deleniti cumque fugiat at placeat laborum corporis doloremque impedit autem quibusdam, rerum cupiditate. Assumenda quidem perferendis iste veniam, praesentium nemo nisi placeat sit a voluptatibus tenetur fugiat aliquam cumque consequuntur quis commodi dicta eligendi esse incidunt corrupti eius quos consequatur? Id corporis similique exercitationem sunt debitis dicta iusto architecto esse aperiam, harum inventore quia quisquam magni nam earum voluptatum possimus! Quis molestiae beatae quas! Illo amet, cum perspiciatis soluta itaque blanditiis officiis quos laborum. Ullam natus, velit soluta earum quaerat molestiae tenetur quia distinctio ratione eum aperiam deleniti adipisci eius beatae ut fugit dolorum ipsam vero suscipit assumenda laboriosam, iste ipsa repellat. Ab quo aut voluptatem nulla veritatis hic aliquam blanditiis fugit soluta corrupti voluptates animi atque, ullam excepturi dolorem, aliquid et dolore possimus, tempora at! Id illum recusandae reiciendis. Cupiditate quam repellendus quas laudantium. Tenetur aliquid odit quisquam sequi perspiciatis cum molestiae quam quibusdam minima reiciendis sit, voluptates rerum esse libero obcaecati ad animi temporibus ipsam officiis. Est vero a dignissimos esse accusantium cumque nam ad, numquam nemo provident molestiae similique facilis quam libero! Hic non neque quibusdam? Sit quae libero maxime nulla, nobis exercitationem ipsa dolorum accusantium assumenda voluptatum dignissimos alias rem. Unde laudantium facilis cupiditate sit quo?
            </div>

        </div>
    );
};

export default Instr_Groups;

