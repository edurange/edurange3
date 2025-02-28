import re
import yaml
from pathlib import Path
import sys

def extract_content_blocks(markdown_text):
    """Extract content blocks from markdown text based on special tags."""
    # Extract scenario title (first H1 header)
    title_match = re.search(r'^# (.+)$', markdown_text, re.MULTILINE)
    scenario_title = title_match.group(1) if title_match else "Untitled Scenario"
    
    # Extract chapters
    chapter_pattern = r'<!-- CHAPTER_START (\d+): (.+?) -->(.*?)<!-- CHAPTER_END -->'
    chapters = []
    
    for match in re.finditer(chapter_pattern, markdown_text, re.DOTALL):
        chapter_num = int(match.group(1))
        chapter_title = match.group(2)
        chapter_content = match.group(3).strip()
        
        chapters.append({
            "chapter_num": chapter_num,
            "title": chapter_title,
            "content": chapter_content
        })
    
    # Sort chapters by chapter_num
    chapters.sort(key=lambda x: x["chapter_num"])
    
    return scenario_title, chapters

def parse_all_content(chapters):
    """Parse all chapters and create sequential IDs for readings and questions."""
    content_blocks = []
    reading_count = 0
    question_count = 0
    
    for chapter in chapters:
        chapter_num = chapter["chapter_num"]
        chapter_content = chapter["content"]
        
        # Extract readings
        reading_pattern = r'<!-- READING_START -->(.*?)<!-- READING_END -->'
        for match in re.finditer(reading_pattern, chapter_content, re.DOTALL):
            reading_count += 1
            reading_id = f"Reading{reading_count}"
            reading_content = match.group(1).strip()
            
            content_blocks.append({
                "id": reading_id,
                "chapter_num": chapter_num,
                "type": "reading",
                "content": reading_content  # Will be formatted with pipe syntax later
            })
        
        # Extract questions
        question_pattern = r'<!-- QUESTION_START -->(.*?)<!-- QUESTION_END -->'
        for match in re.finditer(question_pattern, chapter_content, re.DOTALL):
            question_count += 1
            question_id = f"Question{question_count}"
            question_content = match.group(1).strip()
            
            # Parse question content
            question_text_match = re.search(r'Question: (.+?)(?:\n|$)', question_content, re.DOTALL)
            question_text = question_text_match.group(1).strip() if question_text_match else ""
            
            comment_match = re.search(r'Comment: (.+?)(?:\n|$)', question_content, re.DOTALL)
            comment = comment_match.group(1).strip() if comment_match else ""
            
            # Parse answers
            answers = []
            
            answers_match = re.search(r'Answers:\s*\n((?:.+\n?)+?)(?:\n\n|$)', question_content, re.DOTALL)
            if answers_match:
                answers_text = answers_match.group(1)
                answer_blocks = answers_text.strip().split('\n\n')
                
                for answer_block in answer_blocks:
                    answer_lines = answer_block.strip().split('\n')
                    answer_data = {
                        'answer_type': 'String'  # TODO Essay questions? Multiple choice? Just strings for now
                    }
                    
                    for line in answer_lines:
                        if line.startswith('Value:'):
                            answer_data['value'] = line[6:].strip()
                        elif line.startswith('Points:'):
                            try:
                                answer_data['points_possible'] = int(line[7:].strip())
                            except ValueError:
                                answer_data['points_possible'] = 1
                    
                    if 'value' in answer_data:
                        if 'points_possible' not in answer_data:
                            answer_data['points_possible'] = 1
                        answers.append(answer_data)
            
            # Calculate total points
            points_possible = sum(answer.get("points_possible", 1) for answer in answers)
            
            content_blocks.append({
                "id": question_id,
                "chapter_num": chapter_num,
                "type": "question",
                "question_num": question_count,
                "comment": comment,
                "content": question_text,
                "options": [],  # TODO Not sure what to use this for, but we have extra room here to add question modifiers
                "answers": answers,
                "points_possible": points_possible
            })
    
    return content_blocks

def create_yaml_structure(scenario_title, chapters, content_blocks):
    """Create the final YAML structure."""
    # Create content definitions and student guide structure
    content_definitions = {}
    student_guide = {"chapters": []}
    
    # Organize content blocks by chapter
    chapter_content_blocks = {}
    for block in content_blocks:
        chapter_num = block["chapter_num"]
        if chapter_num not in chapter_content_blocks:
            chapter_content_blocks[chapter_num] = []
        
        # Create a copy without chapter_num
        block_copy = block.copy()
        del block_copy["chapter_num"]
        
        # Add to content definitions
        block_id = block["id"]
        content_def_copy = block_copy.copy()
        del content_def_copy["id"]
        content_definitions[block_id] = content_def_copy
        
        # Add to chapter content blocks
        chapter_content_blocks[chapter_num].append(block_copy)
    
    # Create student guide chapters
    for chapter in chapters:
        chapter_num = chapter["chapter_num"]
        chapter_blocks = chapter_content_blocks.get(chapter_num, [])
        
        content_array = []
        for block in chapter_blocks:
            content_array.append({"*" + block["id"]: None})
        
        student_guide["chapters"].append({
            "chapter_num": chapter_num,
            "title": chapter["title"],
            "content_array": content_array
        })
    
    # Create the final structure
    yaml_structure = {
        "ScenarioTitle": scenario_title,
        "contentDefinitions": content_definitions,
        "studentGuide": student_guide
    }
    
    return yaml_structure

class LiteralString(str):
    """Class to represent a literal string in YAML."""
    pass

def literal_presenter(dumper, data):
    """Presenter for literal strings using the pipe syntax."""
    return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')

def convert_markdown_to_yaml(markdown_path, yaml_path):
    """Convert markdown file to YAML file."""
    # Read markdown file
    markdown_text = Path(markdown_path).read_text()
    
    # Extract content blocks
    scenario_title, chapters = extract_content_blocks(markdown_text)
    
    # Parse all content with sequential IDs
    content_blocks = parse_all_content(chapters)
    
    # Create YAML structure
    yaml_structure = create_yaml_structure(scenario_title, chapters, content_blocks)
    
    # Convert reading content to LiteralString for pipe syntax
    for block_id, block in yaml_structure["contentDefinitions"].items():
        if block["type"] == "reading":
            block["content"] = LiteralString(block["content"])
    
    # Custom YAML dumper to handle anchors, aliases, and literal strings
    class MyDumper(yaml.Dumper):
        def ignore_aliases(self, data):
            return True
    
    # Register the literal presenter
    MyDumper.add_representer(LiteralString, literal_presenter)
    
    # Convert to YAML with proper formatting
    yaml_text = yaml.dump(yaml_structure, Dumper=MyDumper, default_flow_style=False, sort_keys=False)
    
    # Fix the YAML to use anchors and aliases properly
    for block_id in yaml_structure["contentDefinitions"]:
        # Replace the content definition with an anchor
        pattern = f"contentDefinitions:\n  {block_id}:"
        replacement = f"contentDefinitions:\n  {block_id}: &{block_id}"
        yaml_text = yaml_text.replace(pattern, replacement)
        
        # Replace references with aliases
        pattern = f"- '*{block_id}': null"
        replacement = f"- *{block_id}"
        yaml_text = yaml_text.replace(pattern, replacement)
    
    # Write to YAML file
    Path(yaml_path).write_text(yaml_text)
    
    print(f"Converted {markdown_path} to {yaml_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 guide_converter.py <scenario_name>")
        quit(1)

    scenario_name = sys.argv[1]
    convert_markdown_to_yaml(f"../prod/{scenario_name}/guide.md", f"../prod/{scenario_name}/guide_content.yml")

