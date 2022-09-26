from setuptools import setup, Distribution
import pathlib

class BinaryDistribution(Distribution):
    def has_ext_modules(self):
        return True

setup(
    name="usfm-grammar",  # Required
    version="3.0.0-alpha.5",  # Required
    python_requires=">=3.10",
    install_requires=["tree-sitter", "lxml"],  # Optional
    package_data={  # Optional
        "usfm_grammar": ["my-languages.so"],
    },
    distclass = BinaryDistribution,
)
