import React, { useContext } from 'react';
import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Instr_StudentsTable from './Instr_StudentsTable';
import Placard from '@components/Placard';

function Instr_Students() {

    const { groups_state } = useContext(InstructorRouter_context);
    if (!groups_state) { return <></> }

    return (
        <div className='instructor-dash-frame'>

            <div className='instructor-dash-column-main'>
                <div className='instructor-dash-section'>
                    <Placard placard_text={"Students"} />
                    <div className="table-frame">
                        <Instr_StudentsTable />
                    </div>
                </div>
            </div>

            <div className='instructor-dash-column-alt'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto sequi corporis quam ipsa, corrupti necessitatibus voluptates, esse repellendus in commodi sit non? Debitis eos nisi accusamus perspiciatis sit quisquam, nulla modi dolorem repellendus maxime earum quas atque autem sapiente cumque explicabo, reprehenderit quod totam assumenda hic voluptatum facilis! Quam sit deserunt alias laudantium veritatis ab quia, architecto, omnis quasi repellendus perspiciatis rerum quidem libero odio facere nobis? Recusandae illo ab esse unde ullam nulla. Quam dolore aliquam sunt autem iste eius sint? Sint laudantium officia consectetur sed cupiditate architecto corporis possimus eos vero rem, dignissimos placeat reprehenderit earum similique sunt? Inventore vero consequuntur nesciunt quod ullam, quia a repellendus odio unde ex corporis nam iusto vel dicta porro ipsam et tempore quos minima aperiam? Debitis corporis ipsum, officia dolorem ratione odio rem quasi. Iure at beatae veritatis quis, veniam molestiae laudantium repellendus neque laborum optio ipsa rerum ex ad et harum pariatur officiis fugit! Asperiores, placeat! Quibusdam a, laboriosam odit at dolorum excepturi possimus hic fugit beatae assumenda repudiandae. Cumque sit officiis dolorem, explicabo veniam corporis unde, obcaecati aut repudiandae est veritatis? Vitae aut sapiente placeat labore deleniti quis eveniet quo odio numquam natus! Dignissimos ipsa laboriosam alias, enim beatae officia magnam voluptas quam architecto neque, accusamus nemo necessitatibus? At corrupti explicabo vitae commodi ipsum consequatur voluptate quis impedit voluptates deserunt et quibusdam, modi sunt saepe nisi iusto accusamus! Voluptates magnam nam similique aliquid perferendis, tenetur voluptas error iste reiciendis sit labore harum quibusdam corporis tempore quas natus beatae, soluta provident unde a assumenda dolorem sequi. Porro ex tenetur fuga nobis aperiam ipsam distinctio expedita harum a quae, nam doloribus quam optio, recusandae magnam saepe pariatur enim, deserunt debitis ducimus repellendus explicabo? At maiores, tenetur minima dolorem sequi cumque, porro impedit nesciunt repudiandae, repellat deserunt labore accusamus distinctio recusandae inventore!
            </div>
            
        </div>
    );
};

export default Instr_Students;