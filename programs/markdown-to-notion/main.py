import os
import sys

from notion.client import NotionClient
from notion.block import PageBlock
from md2notion.upload import upload

# Follow the instructions at https://github.com/jamalex/notion-py#quickstart to setup token
client = NotionClient(token_v2=os.environ.get('NOTION_PERSONAL_TOKEN_V2'))
page = client.get_block(os.environ.get('NOTION_UPLOAD_PAGE'), True)

# print("Title is:", page.title)

with open(str(sys.argv[1]), "r", encoding="utf-8") as mdFile:
    newPage = page.children.add_new(PageBlock, title="TestMarkdown Upload")
    upload(mdFile, newPage) # Appends the converted contents of TestMarkdown.md to newPage
