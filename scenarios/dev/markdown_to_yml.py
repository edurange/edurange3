import sys
import re
import yaml
from pathlib import Path


class LiteralString(str):
    """Class to represent a literal string in YAML."""

    pass


def literal_presenter(dumper, data):
    """Presenter for literal strings using the pipe syntax."""
    return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")


def extract_content_blocks(markdown_text):
    """Extract content blocks from markdown text based on special tags."""
    # Extract scenario title (first H1 header)
    title_match = re.search(r"^# (.+)$", markdown_text, re.MULTILINE)
    scenario_title = title_match.group(1) if title_match else "Untitled Scenario"

    # Extract chapters
    chapter_pattern = r"<!-- CHAPTER_START (\d+): (.+?) -->(.*?)<!-- CHAPTER_END -->"
    chapters = []

    for match in re.finditer(chapter_pattern, markdown_text, re.DOTALL):
        chapter_num = int(match.group(1))
        chapter_title = match.group(2)
        chapter_content = match.group(3).strip()

        chapters.append({
            "chapter_num": chapter_num,
            "title": chapter_title,
            "content": chapter_content,
        })

    # Sort chapters by chapter_num
    chapters.sort(key=lambda x: x["chapter_num"])

    return scenario_title, chapters


def parse_chapter_content(chapter_content, chapter_num):
    """Parse chapter content to extract readings and questions in order."""
    content_blocks = []

    # Extract both readings and questions with their positions
    pattern = r"<!-- (READING|QUESTION)_START -->(.*?)<!-- \1_END -->"

    for match in re.finditer(pattern, chapter_content, re.DOTALL):
        block_type = match.group(1).lower()
        block_content = match.group(2).strip()
        start_pos = match.start()

        if block_type == "reading":
            content_blocks.append({
                "type": "reading",
                "content": block_content,
                "position": start_pos,
                "chapter_num": chapter_num,
            })
        elif block_type == "question":
            # Parse question content
            question_text_match = re.search(
                r"Question: (.+?)(?:\n|$)", block_content, re.DOTALL
            )
            question_text = (
                question_text_match.group(1).strip() if question_text_match else ""
            )

            comment_match = re.search(
                r"Comment: (.+?)(?:\n|$)", block_content, re.DOTALL
            )
            comment = comment_match.group(1).strip() if comment_match else ""

            # Parse answers
            answers = []

            answers_match = re.search(
                r"Answers:\s*\n((?:.+\n?)+?)(?:\n\n|$)", block_content, re.DOTALL
            )
            if answers_match:
                answers_text = answers_match.group(1)
                answer_blocks = answers_text.strip().split("\n\n")

                for answer_block in answer_blocks:
                    answer_lines = answer_block.strip().split("\n")
                    answer_data = {
                        "answer_type": "String"  # Always set to String
                    }

                    for line in answer_lines:
                        if line.startswith("Value:"):
                            answer_data["value"] = line[6:].strip()
                        elif line.startswith("Points:"):
                            try:
                                answer_data["points_possible"] = int(line[7:].strip())
                            except ValueError:
                                answer_data["points_possible"] = 1

                    if "value" in answer_data:
                        if "points_possible" not in answer_data:
                            answer_data["points_possible"] = 1
                        answers.append(answer_data)

            # Calculate total points
            points_possible = sum(
                answer.get("points_possible", 1) for answer in answers
            )

            content_blocks.append({
                "type": "question",
                "content": question_text,
                "comment": comment,
                "answers": answers,
                "points_possible": points_possible,
                "options": [],  # Always set to empty list
                "position": start_pos,
                "chapter_num": chapter_num,
            })

    # Sort blocks by their position in the original text
    content_blocks.sort(key=lambda x: x["position"])

    # Remove position field as it's no longer needed
    for block in content_blocks:
        del block["position"]

    return content_blocks


def parse_all_content(chapters):
    """Parse all chapters and create sequential IDs for readings and questions."""
    all_content_blocks = []
    reading_count = 0
    question_count = 0

    for chapter in chapters:
        chapter_num = chapter["chapter_num"]
        chapter_content = chapter["content"]

        # Get content blocks for this chapter, preserving order
        chapter_blocks = parse_chapter_content(chapter_content, chapter_num)

        # Assign sequential IDs
        for block in chapter_blocks:
            if block["type"] == "reading":
                reading_count += 1
                block["id"] = f"Reading{reading_count}"
            elif block["type"] == "question":
                question_count += 1
                block["id"] = f"Question{question_count}"
                block["question_num"] = question_count

        all_content_blocks.extend(chapter_blocks)

    return all_content_blocks


def create_yaml_structure(scenario_title, chapters, content_blocks):
    """Create the final YAML structure."""
    # Create content definitions and student guide structure
    content_definitions = {}
    student_guide = {"chapters": []}

    # Add all content blocks to content_definitions
    for block in content_blocks:
        block_id = block["id"]
        block_copy = block.copy()
        del block_copy["id"]
        del block_copy["chapter_num"]
        content_definitions[block_id] = block_copy

    # Create student guide chapters with content in original order
    for chapter in chapters:
        chapter_num = chapter["chapter_num"]

        # Get content blocks for this chapter in their original order
        chapter_blocks = [b for b in content_blocks if b["chapter_num"] == chapter_num]

        content_array = []
        for block in chapter_blocks:
            content_array.append({"*" + block["id"]: None})

        student_guide["chapters"].append({
            "chapter_num": chapter_num,
            "title": chapter["title"],
            "content_array": content_array,
        })

    # Create the final structure
    yaml_structure = {
        "ScenarioTitle": scenario_title,
        "contentDefinitions": content_definitions,
        "studentGuide": student_guide,
    }

    return yaml_structure


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
    yaml_text = yaml.dump(
        yaml_structure, Dumper=MyDumper, default_flow_style=False, sort_keys=False
    )

    # Process the YAML text to add anchors and fix indentation
    processed_lines = []
    in_content_defs = False
    in_student_guide = False
    current_indent = 0

    for line in yaml_text.split("\n"):
        # Track sections
        if line.strip() == "contentDefinitions:":
            in_content_defs = True
            in_student_guide = False
            current_indent = 0
        elif line.strip() == "studentGuide:":
            in_content_defs = False
            in_student_guide = True
            current_indent = 0

        # Add anchors to content definitions
        if (
            in_content_defs
            and line.strip()
            and ":" in line
            and not line.strip().startswith("-")
        ):
            key = line.split(":", 1)[0].strip()
            if key in yaml_structure["contentDefinitions"]:
                # This is a content definition key
                indent = len(line) - len(line.lstrip())
                line = " " * indent + f"{key}: &{key}"

        # Fix aliases in student guide
        if in_student_guide and line.strip().startswith("- '*"):
            for block_id in yaml_structure["contentDefinitions"]:
                if f"'*{block_id}': null" in line:
                    indent = len(line) - len(line.lstrip())
                    line = " " * indent + f"- *{block_id}"
                    break

        processed_lines.append(line)

    # Join the processed lines
    processed_yaml = "\n".join(processed_lines)

    # Write to YAML file
    Path(yaml_path).write_text(processed_yaml)

    print(f"Converted {markdown_path} to {yaml_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 guide_converter.py <scenario_name>")
        quit(1)

    scenario_name = sys.argv[1]
    convert_markdown_to_yaml(f"../prod/{scenario_name}/guide.md", f"../prod/{scenario_name}/guide_content.yml")
