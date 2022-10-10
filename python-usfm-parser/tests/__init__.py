'''The common methods and objects needed in all tests. To be run before all tests'''
from src.usfm_grammar import usfm_parser

TEST_DIR = "../tests"

def initialise_parser(input_usfm_file):
    '''Open and parse the given file'''
    print("Comes here alright!")
    with open(input_usfm_file, 'r', encoding='utf-8') as usfm_file:
        usfm_string = usfm_file.read()
    test_parser = usfm_parser.USFMParser(usfm_string)
    return test_parser
