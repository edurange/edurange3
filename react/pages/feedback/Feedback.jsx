import React, { useState } from 'react';
import './feedback.css'

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    scenario: '',
    scenarioSelect: '',
    scenarioDifficulty: '',
    comments: ''
});

  const [isScenarioFeedback, setIsScenarioFeedback] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleScenarioChange = (e) => {
    const { value } = e.target;
    setIsScenarioFeedback(value === 'yes');
    if (value === 'no') {
      setFormData({
        ...formData,
        scenarioSelect: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();        
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
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
          value={formData.email}
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
          <label htmlFor="scenarioSelect">Select Scenario:</label>
          <select
            id="scenarioSelect"
            name="scenarioSelect"
            onChange={handleChange}
            value={formData.scenarioSelect}
            required
          >
            <option value="">Select a scenario</option>
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
          value={formData.scenarioDifficulty}
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
        <label htmlFor="comments">Additional Comments:</label>
        <textarea
          id="comments"
          name="comments"
          rows="4"
          cols="50"
          value={formData.comments}
          onChange={handleChange}
        ></textarea>
      </div>

      <input type="submit" value="Submit Feedback" />
    </form>
  );
};

export default Feedback;
