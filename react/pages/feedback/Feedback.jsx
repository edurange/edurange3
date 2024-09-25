import React, { useState } from 'react';
import './feedback.css'
import axios from 'axios';

function Feedback () {

  const [formData_state, set_formData_state] = useState({
    // name: '',
    // email: '',
    scenario_type: '',
    scenarioSelect: '',
    scenarioDifficulty: '',
    content: ''
});

  const [isScenarioFeedback, setIsScenarioFeedback] = useState(false);

  function handleChange (e) {
    const { name, value } = e.target;
    set_formData_state({
      ...formData_state,
      [name]: value
    });
  };

  function handleScenarioChange (e) {
    const { value } = e.target;
    setIsScenarioFeedback(value === 'yes');
    if (value === 'no') {
      set_formData_state({
        ...formData_state,
        scenarioSelect: ''
      });
    }
  };

  async function handleSubmit (event) {
    event.preventDefault();
    feedback_response = await axios.post('/feedback', formData_state)
    console.log(feedback_response)
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData_state.name}
          onChange={handleChange}   
          placeholder='Not Required'       
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData_state.email}
          onChange={handleScenarioChange}
          placeholder='Not Required'
        />
      </div> 

      <div className="form-group">
        <label>Is your feedback about a scenario?</label>
        <div className="scenario">
          <label>
            <input
              type="radio"
              name="scenario"
              value="yes"                            
              onChange={handleScenarioChange}
              checked={isScenarioFeedback}
              required
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="scenario"
              value="no"              
              onChange={handleScenarioChange}
              checked={!isScenarioFeedback}
            />
            No
          </label>          
        </div>
      </div>

      {isScenarioFeedback && (
        <div className="form-group">
          <label htmlFor="scenarioSelect">Select scenario_type:</label>
          <select
            id="scenarioSelect"
            name="scenarioSelect"
            onChange={handleChange}
            value={formData_state.scenarioSelect}
            required
          >
            <option value="">Select a scenario_type</option>
            <option value="elf_infection">Elf Infection</option>
            <option value="file_wrangler">File Wrangler</option>
            <option value="getting_started">Getting Started</option>
            <option value="metasploitable">Metasploitable</option>
            <option value="ransomware">Ransomware</option>
            <option value="ssh_inception">SSH Inception</option>
            <option value="strace">Strace</option>
            <option value="total_recon">Total Recon</option>
            <option value="treasure_hunt">Treasure Hunt</option>
            <option value="web_fu">Web Fu</option>
          </select>
        </div>
      )}

      {isScenarioFeedback && (
        <div className="form-group">
        <label htmlFor="scenarioDifficulty">How difficult did you find the scenario?</label>
        <select
          id="scenarioDifficulty"
          name="scenarioDifficulty"
          value={formData_state.scenarioDifficulty}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="extremely_difficult">Extremely Difficult</option>
          <option value="difficult">Difficult</option>
          <option value="average">Average</option>
          <option value="easy">Easy</option>
          <option value="extremely_easy">Extremely Easy</option>
        </select>
      </div>
      )}

      <div className="form-group">
        <label htmlFor="content">Additional comments:</label>
        <textarea
          id="content"
          name="content"
          rows="4"
          cols="50"
          value={formData_state.content}
          onChange={handleChange}
        ></textarea>
      </div>

      <input type="submit" value="Submit Feedback" />
    </form>
  );
};

export default Feedback;
