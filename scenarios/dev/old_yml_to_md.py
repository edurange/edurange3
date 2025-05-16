import sys
import yaml
from pathlib import Path

def load_yaml_file(yaml_path):
    """Load YAML file and return its content."""
    with open(yaml_path, 'r') as file:
        # Use safe_load to handle anchors and aliases
        yaml_content = yaml.safe_load(file)
    return yaml_content

def convert_yaml_to_markdown(yaml_path, markdown_path):
    """Convert YAML file to markdown file."""
    # Load YAML content
    yaml_content = load_yaml_file(yaml_path)
    
    # Extract scenario title
    scenario_title = yaml_content.get('ScenarioTitle', 'Untitled Scenario')
    
    # Get content definitions and student guide
    content_definitions = yaml_content.get('contentDefinitions', {})
    student_guide = yaml_content.get('studentGuide', {})
    
    # Start building markdown
    markdown_lines = [f"# {scenario_title}\n"]
    
    # Process each chapter
    for chapter in student_guide.get('chapters', []):
        chapter_num = chapter.get('chapter_num')
        chapter_title = chapter.get('title')
        
        markdown_lines.append(f"\n<!-- CHAPTER_START {chapter_num}: {chapter_title} -->")
        
        # Process each content item in the chapter
        for content_ref in chapter.get('content_array', []):
            # Find the content definition for this reference
            content_id = None
            
            # Try to extract the content ID from the YAML structure
            if isinstance(content_ref, str):
                # This might be a direct reference like "*Reading1"
                if content_ref.startswith('*'):
                    content_id = content_ref[1:]
            elif isinstance(content_ref, dict):
                # This might be a reference that wasn't resolved
                for key in content_ref:
                    if key.startswith('*'):
                        content_id = key[1:]
            
            # If we couldn't find a content ID, try to use the content directly
            if content_id is None and hasattr(content_ref, 'get'):
                content_block = content_ref
            elif content_id in content_definitions:
                content_block = content_definitions[content_id]
            else:
                # Skip this content if we can't resolve it
                continue
            
            # Process based on content type
            block_type = content_block.get('type')
            
            if block_type == 'reading':
                reading_content = content_block.get('content', '')
                markdown_lines.append("\n<!-- READING_START -->")
                markdown_lines.append(reading_content)
                markdown_lines.append("<!-- READING_END -->")
            
            elif block_type == 'question':
                question_content = content_block.get('content', '')
                comment = content_block.get('comment', '')
                answers = content_block.get('answers', [])
                
                markdown_lines.append("\n<!-- QUESTION_START -->")
                markdown_lines.append(f"Question: {question_content}")
                
                if comment:
                    markdown_lines.append(f"Comment: {comment}")
                
                if answers:
                    markdown_lines.append("\nAnswers:")
                    
                    for i, answer in enumerate(answers):
                        if i > 0:
                            markdown_lines.append("")  # Add blank line between answers
                        
                        value = answer.get('value', '')
                        points = answer.get('points_possible', 1)
                        
                        markdown_lines.append(f"Value: {value}")
                        markdown_lines.append(f"Points: {points}")
                
                markdown_lines.append("<!-- QUESTION_END -->")
        
        markdown_lines.append("\n<!-- CHAPTER_END -->")
    
    # Write to markdown file
    markdown_content = "\n".join(markdown_lines)
    Path(markdown_path).write_text(markdown_content)
    
    print(f"Converted {yaml_path} to {markdown_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 yml_to_md_guide.py <scenario_name>")
        quit(1)
    
    scenario_name = sys.argv[1]
    convert_yaml_to_markdown(f"../prod/{scenario_name}/guide_content.yml", f"../prod/{scenario_name}/guide.md")



