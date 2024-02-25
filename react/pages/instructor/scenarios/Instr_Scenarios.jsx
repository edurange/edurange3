
import React from 'react';
import Instr_ScenTable from './Instr_ScenTable';
import CreateScenario from './CreateScenario';
import '@assets/css/tables.css';
import Placard from '@components/Placard';

function Instr_Scenarios() {

    return (
        <div className='instructor-dash-frame'>

            <div className='instructor-dash-column-main'>
                <div className='instructor-dash-section'>
                    <Placard placard_text={"Scenarios"} />
                        <CreateScenario />
                    <div className="table-frame">
                        <Instr_ScenTable />                
                    </div>
                </div>
            </div>

            <div className='instructor-dash-column-alt'>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nostrum dolorem neque distinctio, quas, corrupti, incidunt repellat dolores omnis aliquid illo ipsam id. Nemo cupiditate, ullam nobis ipsum sed quod eius deserunt sint dolor ea harum omnis perspiciatis? Cum, voluptas velit. Porro quis molestiae ullam repellendus. Exercitationem minima quo vero dolorem id quod libero voluptatem voluptatibus deleniti earum laboriosam, velit neque qui tempore dolores ex. Nisi quae, laboriosam, nulla, unde tempora obcaecati corrupti doloribus repellat quo optio dolorum? Debitis nam temporibus odit expedita officia accusantium enim. Mollitia, a. Reiciendis recusandae excepturi id? Molestiae odit quam illo magni impedit, tempore blanditiis? Dolorum numquam odit nostrum quae, a nulla quisquam iste mollitia nemo vero necessitatibus facilis recusandae quidem ipsa reprehenderit repellat provident vitae porro repudiandae officiis aliquid deserunt? Delectus autem sequi quaerat reprehenderit fugit nihil consequuntur, deleniti in, nulla doloribus eveniet! Vero ipsam sapiente, officia recusandae libero delectus beatae, totam impedit rerum laudantium quae sit corrupti explicabo veritatis voluptate, nesciunt id repellat molestiae dolore eius. Sapiente atque consequuntur nesciunt, impedit nam eaque, aspernatur inventore mollitia incidunt eveniet blanditiis nobis. Placeat maxime ratione doloribus officiis quia quisquam incidunt delectus odio recusandae aut modi, expedita natus sint. Quae, totam. Nemo asperiores aliquid tempore. Exercitationem similique dignissimos eos nemo aliquid accusantium iure odio illo, atque, quaerat quo itaque dicta! Doloremque iusto similique rem molestiae sunt dicta natus vero sapiente odio facere tempora, reprehenderit perferendis cum numquam, aliquid vitae laboriosam inventore, sed suscipit eaque! Expedita voluptatibus illo quisquam in corrupti consequuntur, debitis nihil beatae, porro enim vel reiciendis optio assumenda eum sit repellendus pariatur. Deleniti nam molestiae illum sapiente itaque. Fugiat totam corporis doloremque minus dicta accusantium velit saepe maxime enim? Eaque quos numquam natus consectetur, tempora quia veniam laudantium sequi a fuga consequuntur quaerat dolores vero libero, dolore quae dolorem deleniti nemo harum nobis iste laborum!
            </div>

        </div>
    );
};

export default Instr_Scenarios;