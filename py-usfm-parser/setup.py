from setuptools import setup, Distribution
import pathlib

class BinaryDistribution(Distribution):
    def has_ext_modules(self):
        return True

setup(
    name="usfm-grammar",  # Required
    version="3.0.0-beta.16",  # Required
    python_requires=">=3.10",
    # install_requires=["tree-sitter==0.22.3",
                        # "tree-sitter-usfm3==3.0.0-beta.7",  
                        # "lxml==5.2.2"],  # Optional
    distclass = BinaryDistribution,
)
